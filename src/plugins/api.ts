import type { SourceFile, ClassDeclaration } from 'ts-morph';
import type { Main } from '../element/elements/main';
import type { GemBookElement } from '../element';

interface StaticProperty {
  name: string;
  slot?: string;
  part?: string;
  type?: string;
}

interface StaticMethod {
  name: string;
  type?: string;
}

interface Property {
  name: string;
  reactive: boolean;
  attribute?: string;
  slot?: string;
  part?: string;
  cssState?: string;
  type?: string;
}

interface Method {
  name: string;
  event?: string;
  isGlobalEvent?: boolean;
  type?: string;
}

interface ElementDetail {
  constructorName: string;
  constructorParams: { name: string; type?: string }[];
  staticProperties: StaticProperty[];
  staticMethods: StaticMethod[];
  properties: Property[];
  methods: Method[];
}

type State = { elements: (ElementDetail & { name: string })[] };

customElements.whenDefined('gem-book').then(() => {
  const { GemBookPluginElement } = customElements.get('gem-book') as typeof GemBookElement;
  const MainElement = customElements.get('gem-book-main') as typeof Main;
  const { Gem, config } = GemBookPluginElement;
  const { html, customElement, attribute, numattribute, camelToKebabCase } = Gem;
  const parser = new MainElement();

  @customElement('gbp-api')
  class _GbpMediaElement extends GemBookPluginElement<State> {
    static elementDecoratorName = ['customElement'];
    static attrDecoratorName = ['attribute', 'boolattribute', 'numattribute'];
    static propDecoratorName = ['property'];
    static stateDecoratorName = ['state'];
    static slotDecoratorName = ['slot'];
    static partDecoratorName = ['part'];
    static eventDecoratorName = ['emitter', 'globalemitter'];
    static lifecycleMethods = ['willMount', 'render', 'mounted', 'shouldUpdate', 'updated', 'unmounted'];

    constructor() {
      super({ isLight: true });
    }

    @attribute src: string;
    @numattribute headerLevel: number;

    state: State = {
      elements: [],
    };

    #getRemoteUrl = () => {
      if (!this.src) return '';

      let url = this.src;
      if (this.src.startsWith('/') && !this.src.startsWith('//')) {
        if (!config.github || !config.sourceBranch) return '';
        const rawOrigin = 'https://raw.githubusercontent.com';
        const repo = new URL(config.github).pathname;
        url = `${rawOrigin}${repo}/${config.sourceBranch}${this.src}`;
      }
      return url;
    };

    #getElements = (file: SourceFile) => {
      const { elementDecoratorName } = _GbpMediaElement;
      const result: { cls: ClassDeclaration; name: string }[] = [];
      for (const cls of file.getClasses()) {
        const elementDecoratior = cls
          .getDecorators()
          .find((decorator) => elementDecoratorName.includes(decorator.getName()));
        if (elementDecoratior) {
          result.push({ cls: cls, name: elementDecoratior.getCallExpression()!.getArguments()[0].getText() });
        }
      }
      return result;
    };

    #parseElement = (cls: ClassDeclaration) => {
      const {
        attrDecoratorName,
        propDecoratorName,
        stateDecoratorName,
        slotDecoratorName,
        partDecoratorName,
        eventDecoratorName,
        lifecycleMethods,
      } = _GbpMediaElement;
      const result: ElementDetail = {
        constructorName: '',
        constructorParams: [],
        staticProperties: [],
        staticMethods: [],
        properties: [],
        methods: [],
      };
      const className = cls.getName();
      const constructor = cls.getConstructors()[0];
      if (constructor && className) {
        result.constructorName = className;
        result.constructorParams = constructor.getParameters().map((param) => ({ name: param.getName() }));
      }

      const staticPropertieDeclarations = cls.getStaticProperties();
      for (const staticPropDeclaration of staticPropertieDeclarations) {
        const staticPropName = staticPropDeclaration.getName();
        // const propType =
        // const propInitValue =
        const prop: StaticProperty = { name: staticPropName };
        result.staticProperties.push(prop);

        const staticPorpDecorators = staticPropDeclaration.getDecorators();
        for (const decorator of staticPorpDecorators) {
          const decoratorName = decorator.getName();
          if (slotDecoratorName.includes(decoratorName)) {
            prop.slot = camelToKebabCase(staticPropName);
          } else if (partDecoratorName.includes(decoratorName)) {
            prop.part = camelToKebabCase(staticPropName);
          }
        }
      }

      const staticMethodDeclarations = cls.getStaticMethods();
      for (const staticMethodDeclaration of staticMethodDeclarations) {
        const staticMethodName = staticMethodDeclaration.getName();
        const method: StaticMethod = { name: staticMethodName };
        result.staticMethods.push(method);
      }

      const propDeclarations = cls.getProperties();
      for (const propDeclaration of propDeclarations) {
        const propName = propDeclaration.getName();
        if (lifecycleMethods.includes(propName)) continue;
        const prop: Property = { name: propName, reactive: false };
        result.properties.push(prop);

        const porpDecorators = propDeclaration.getDecorators();
        for (const decorator of porpDecorators) {
          const decoratorName = decorator.getName();
          if (attrDecoratorName.includes(decoratorName)) {
            prop.reactive = true;
            prop.attribute = camelToKebabCase(propName);
          } else if (propDecoratorName.includes(decoratorName)) {
            prop.reactive = true;
          } else if (stateDecoratorName.includes(decoratorName)) {
            prop.cssState = `--${camelToKebabCase(propName)}`;
          } else if (slotDecoratorName.includes(decoratorName)) {
            prop.slot = camelToKebabCase(propName);
          } else if (partDecoratorName.includes(decoratorName)) {
            prop.part = camelToKebabCase(propName);
          }
        }
      }

      const methodDeclarations = cls.getMethods();
      for (const methodDeclaration of methodDeclarations) {
        const methodName = methodDeclaration.getName();
        if (lifecycleMethods.includes(methodName)) continue;
        const method: Method = { name: methodName };
        result.methods.push(method);

        const methodDecorators = methodDeclaration.getDecorators();
        for (const decorator of methodDecorators) {
          const decoratorName = decorator.getName();
          if (eventDecoratorName.includes(decoratorName)) {
            method.event = camelToKebabCase(decoratorName);
          }
        }
      }
      return result;
    };

    #parseElements = async (text: string) => {
      const { Project } = await import('ts-morph'); // esm ?
      const project = new Project({
        useInMemoryFileSystem: true,
      });
      const file = project.createSourceFile(this.src, text);
      const elements = this.#getElements(file);
      return elements.map(({ cls, name }) => {
        return { name, ...this.#parseElement(cls) };
      });
    };

    #renderHeader = (n: number) => {
      return '#'.repeat(n + ((this.headerLevel || 1) - 1));
    };

    #renderCode = (s?: string) => {
      return s ? `\`${s}\`` : '';
    };

    #renderTable = <T>(list: T[], headers: string[], fields: ((data: T) => string)[]) => {
      let text = '';
      text += headers.reduce((p, c, index) => p + `${headers[index]} |`, '|') + '\n';
      text += headers.reduce((p) => p + `--- |`, '|') + '\n';
      text += list.reduce((p, c, dataIndex) => {
        return p + headers.reduce((p, c, index) => p + `${fields[index](list[dataIndex])} |`, '|') + '\n';
      }, '');
      return text;
    };

    #renderElement = ({
      name,
      constructorName,
      constructorParams,
      staticProperties,
      staticMethods,
      properties,
      methods,
    }: ElementDetail & {
      name: string;
    }) => {
      let text = name.replace(/('|")(.*)\1/, `${this.#renderHeader(1)} $2`) + '\n\n';
      if (constructorName) {
        text += `${this.#renderHeader(2)} Constructor \`${constructorName}()\`\n\n`;
        text += this.#renderTable(constructorParams, ['Params'], [({ name }) => this.#renderCode(name)]);
      }
      if (staticProperties.length) {
        text += `${this.#renderHeader(2)} Static Properties\n\n`;
        text += this.#renderTable(
          staticProperties,
          ['Property', 'Slot', 'Part'],
          [
            ({ name }) => this.#renderCode(name),
            ({ slot }) => this.#renderCode(slot),
            ({ part }) => this.#renderCode(part),
          ],
        );
      }
      if (staticMethods.length) {
        text += `${this.#renderHeader(2)} Static Methods\n\n`;
        text += this.#renderTable(staticMethods, ['Method'], [({ name }) => this.#renderCode(name)]);
      }
      if (properties.length) {
        text += `${this.#renderHeader(2)} Instance Properties\n\n`;
        text += this.#renderTable(
          properties,
          ['Property', 'Reactive', 'Attribute', 'Slot', 'Part', 'CSS State'],
          [
            ({ name }) => this.#renderCode(name),
            ({ reactive }) => (reactive ? 'Yes' : ''),
            ({ attribute }) => this.#renderCode(attribute),
            ({ slot }) => this.#renderCode(slot),
            ({ part }) => this.#renderCode(part),
            ({ cssState }) => this.#renderCode(cssState),
          ],
        );
      }
      if (methods.length) {
        text += `${this.#renderHeader(2)} Instance Methods\n\n`;
        text += this.#renderTable(
          methods,
          ['Method', 'Event', 'Global Event'],
          [
            ({ name }) => this.#renderCode(name),
            ({ event }) => this.#renderCode(event),
            ({ isGlobalEvent }) => (isGlobalEvent ? 'Yes' : ''),
          ],
        );
      }
      return parser.parseMarkdown(text);
    };

    render = () => {
      const { elements } = this.state;
      return html`${elements.map(this.#renderElement)}`;
    };

    mounted = () => {
      this.effect(
        async () => {
          const url = this.#getRemoteUrl();
          if (!url) return;

          const text = await (await fetch(url)).text();
          const elements = await this.#parseElements(text);
          this.setState({ elements });
        },
        () => [this.src],
      );
    };
  }
});
