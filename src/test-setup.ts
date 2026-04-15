if (typeof Element !== 'undefined' && !(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
  Element.prototype.scrollIntoView = function () {
    /* jsdom polyfill — no-op */
  };
}
