import { onBeforeUnmount, nextTick } from 'vue';

export default (
  watcher: HTMLElement,
  callback: () => Promise<boolean>,
  index: 'first' | 'last',
) => {
  const threshold = 0.8;
  let callObserveCallback:any;
  const handleEnterObserver = (
    entris: IntersectionObserverEntry[]
  ) => {
    entris.forEach((entiry) => {
      const { intersectionRatio, isIntersecting } = entiry;
      if (isIntersecting) {
        if (intersectionRatio > threshold) {
          if (callObserveCallback) {
            callObserveCallback();
          }
        }
      }
    })
  }
  const observer = new IntersectionObserver(handleEnterObserver, {
    threshold
  })
  const init = () => {
    let observEle;
    if (index === 'first') {
      observEle = watcher.firstElementChild
    } else if (index === 'last') {
      observEle = watcher.lastElementChild
    }
    if (observEle) {
      observer.takeRecords().forEach((record) => {
        observer.unobserve(record.target)
      })
      observer.observe(observEle)
    }
    return !!observEle
  }
  const destroy = () => observer.disconnect();

  callObserveCallback = async () => {
    const continued = await callback();
    if (continued) {
      await nextTick();
      init();
    } else {
      destroy();
    }
  }

  onBeforeUnmount(destroy)

  return {
    init,
    refresh: init,
    destroy,
  }
}