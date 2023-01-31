import DOMPurify from "dompurify";
export default {
  getGroups: () =>
    fetch("/groups")
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => err),
  getDownloads: () =>
    fetch("/download", {
      headers: { secret: process.env.SECRET_HEADER_DOWNLOAD },
    })
      .then((res) => res.text())
      .then((res) => DOMPurify.sanitize(res))
      .catch((err) => err),
  getExpanses: (parameters) =>
    fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => err),
};
