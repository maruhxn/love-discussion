import app from "./app.js";

app.listen(app.get("port"), () => {
  console.log(
    `⚡️[server]: Server is running at ${app.get("port")} PORT with Node ${
      process.version
    }`
  );
});
