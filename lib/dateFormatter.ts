export const formatDateTime = (dateTime: string) => {
  let dat: string = new Date(dateTime).toString();
  let dateTimeParts: string[] = dat.split(/[ ]/);

  return `${dateTimeParts[1]} ${dateTimeParts[2]} ${
    dateTimeParts[3]
  } ${tConvert(dateTimeParts[4])}`;
};

export function compareDate(date: string) {
  const da = new Date(date);
  const currentDate = new Date();
  return da.getTime() < currentDate.getTime();
}

function tConvert(time: string) {
  // Check correct time format and split into components
  let matechedTime: string[] = time
    .toString()
    .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (matechedTime.length > 1) {
    // If matechedTime format correct
    matechedTime = matechedTime.slice(1); // Remove full string match value
    // @ts-ignore
    matechedTime[5] = +matechedTime[0] < 12 ? "AM" : "PM"; // Set AM/PM
    // @ts-ignore
    matechedTime[0] = +matechedTime[0] % 12 || 12; // Adjust hours
  }
  // @ts-ignore
  return matechedTime.join(""); // return adjusted time or original string
}

export function toDateTime(time: string) {
  let dat = time.split(/[T]/);
  dat.push(":00");
  return dat[0] + ":" + dat[1] + dat[2];
}
