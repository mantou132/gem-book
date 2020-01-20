import { html, GemElement, customElement, history, attribute } from '@mantou/gem';
import marked from 'marked';

const parser = new DOMParser();

interface State {
  content: Element[] | null;
}

@customElement('gem-book-main')
export class Main extends GemElement<State> {
  @attribute link: string;

  state = {
    content: null,
  };

  fetchData = async () => {
    const { path } = history.getParams();
    let url = '';
    if (path === '/') {
      url = `${history.basePath}/README.md`;
    } else {
      url = `${history.basePath}${path}.md`;
    }
    const md = await (await fetch(url)).text();
    const elements = [...parser.parseFromString(marked(md), 'text/html').body.children];
    this.setState({
      content: elements,
    });
  };

  mounted() {
    this.fetchData();
  }

  render() {
    return html`
      ${this.state.content}
    `;
  }

  attributeChanged(name: string) {
    if (name === 'link') {
      this.fetchData();
    }
  }
}
