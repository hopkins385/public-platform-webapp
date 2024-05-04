export default function useForHumans() {
  const { locale } = useI18n();

  function getDateTimeForHumans(
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = {},
  ) {
    const date = new Date(value);
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    } as Intl.DateTimeFormatOptions;
    options = Object.assign(defaultOptions, options);
    return date.toLocaleString(locale.value, options);
  }

  function getFileSizeForHumans(value: number) {
    const size = Number(value);
    if (size === 0) return '';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    if (i === 0) return '';
    return (
      Number((size / Math.pow(1024, i)).toFixed(2)) * 1 +
      ' ' +
      ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  }

  return {
    getFileSizeForHumans,
    getDateTimeForHumans,
  };
}
