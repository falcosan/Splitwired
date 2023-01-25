import DOMPurify from "dompurify";
export default {
  getGroups: () =>
    fetch("/groups")
      .then((res) => res.json())
      .then((res) => res),
  getDownloads: () =>
    fetch("/download", {
      headers: { secret: process.env.HEADER_DOWNLOAD_SECRET },
    })
      .then((res) => res.text())
      .then((res) => DOMPurify.sanitize(res)),
  getExpanses: (parameters) =>
    fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: new Headers({
        "Content-type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((res) => res),
};
