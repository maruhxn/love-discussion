import app from "./app.js";

app.listen(app.get("port"), () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${app.get("port")}`
  );
});
