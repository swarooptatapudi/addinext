export const getFormOptionsObject = (array: Array<any>) => {
  const obj: any = {};
  for (const element of array) {
    obj[element?.field_name] = element?.select_options
      ?.split(',')
      ?.filter((item: string) => !!item)
      ?.map((item: string) => {
        return {
          value: item,
          label: item
        };
      });
  }
  return obj;
};

