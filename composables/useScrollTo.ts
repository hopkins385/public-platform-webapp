export const useScrollTo = () => {
  function scrollTo(elId: string) {
    // check if string starts with #
    if (elId.startsWith('#')) {
      // then remove the #
      elId = elId.slice(1);
    }
    const el = document?.getElementById(elId);
    if (!el) return;
    el.scrollIntoView({
      behavior: 'smooth',
    });
  }

  function scrollToTop() {
    window?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return {
    scrollTo,
    scrollToTop,
  };
};
