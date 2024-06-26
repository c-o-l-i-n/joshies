export const pagePaddingXCssClass = 'px-3';
export const pagePaddingXCssAmount = '1rem';

export const pagePaddingYCssClass = 'py-4';
export const pagePaddingYCssAmount = '1.5rem';

export function getCssVariableValue(varName: string): string {
  return window
    .getComputedStyle(window.document.documentElement)
    .getPropertyValue(varName);
}
