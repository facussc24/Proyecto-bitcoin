import { renderNews } from '../../assets/js/ui.js';
import { jest } from '@jest/globals';

describe('renderNews', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul id="news-list"></ul>';
  });

  test('builds list items without using innerHTML', () => {
    const spy = jest.spyOn(HTMLElement.prototype, 'innerHTML', 'set');
    renderNews([{ title: 'Title', link: 'https://example.com', date: Date.now() }]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();

    const li = document.querySelector('#news-list li');
    expect(li).not.toBeNull();
    const a = li.querySelector('a');
    const small = li.querySelector('small');
    expect(a.textContent).toBe('Title');
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(small).not.toBeNull();
  });
});
