import { sanitize } from "isomorphic-dompurify";
export default {
  getGroups: async () =>
   await fetch("/groups")
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => err),
  getDownloads: async () =>
   await fetch("/download", {
      headers: { secret: process.env.SECRET_HEADER_DOWNLOAD },
    })
      .then((res) => res.text())
      .then((res) => sanitize(res))
      .catch((err) => err),
  getExpanses: async (parameters) =>
   await fetch("/expenses", {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => err),
  getLogout: async () =>
   await fetch("/logout", { method: "POST" }).then(() => window.location.reload()),
};
