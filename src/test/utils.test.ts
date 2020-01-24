import { expect } from '@open-wc/testing';
import { capitalize, flatNav, getMdPath } from '../lib/utils';

describe('utils 测试', () => {
  it('capitalize', () => {
    expect(capitalize('abc')).to.equal('Abc');
    expect(capitalize('abc d')).to.equal('Abc d');
  });
  it('flatNav', () => {
    expect(
      flatNav([
        { title: 'title', children: [{ title: 'home', link: '/' }] },
        { title: 'about', link: '/about' },
      ]),
    ).to.deep.equal([
      { title: 'home', link: '/' },
      { title: 'about', link: '/about' },
    ]);
  });
  it('getMdPath', () => {
    expect(getMdPath('/')).to.equal('/README.md');
    expect(getMdPath('/a')).to.equal('/a.md');
    expect(getMdPath('/a/')).to.equal('/a/README.md');
  });
});
