/* eslint-disable no-undef */
const themeSelector = document.getElementById('theme-selector');
const themeCSS = document.getElementById('theme-css');

const themes = [
  { name: 'Default', value: 'default' },
  { name: 'Retro', value: 'retro' },
  { name: 'Github light', value: 'github-markdown-light' },
  { name: 'Github dark', value: 'github-markdown-dark' },
  { name: 'Brew', value: 'screen' },
];

themes.forEach((theme) => {
  const option = document.createElement('option');
  option.value = theme.value;
  option.text = theme.name;
  themeSelector.appendChild(option);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  themeCSS.href = `/docs/style/theme/${savedTheme}.css`;
  themeSelector.value = savedTheme;
}

themeSelector.addEventListener('change', (e) => {
  const theme = e.target.value;
  localStorage.setItem('theme', theme);
  themeCSS.href = `/docs/style/theme/${theme}.css`;
});
