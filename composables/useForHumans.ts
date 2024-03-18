export default function useForHumans() {
  const { locale } = useI18n();

  const getDateTimeForHumans = (value: string | number | Date) => {
    const date = new Date(value);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    } as Intl.DateTimeFormatOptions;
    return date.toLocaleString(locale.value, options);
  };

  const getFileSizeForHumans = (value: number) => {
    const size = Number(value);
    if (size === 0) return '';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    if (i === 0) return '';
    return (
      Number((size / Math.pow(1024, i)).toFixed(2)) * 1 +
      ' ' +
      ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  };

  return {
    getFileSizeForHumans,
    getDateTimeForHumans,
  };
}
