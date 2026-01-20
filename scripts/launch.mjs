import { launch } from "@openfin/node-adapter";

async function launchOpenFin() {
  try {
    const fin = await launch({
      manifestUrl: "http://192.168.68.65:5173/app.json",
    });

    console.log("OpenFin application launched successfully");

    fin.on("disconnected", () => {
      console.log("OpenFin runtime disconnected");
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to launch OpenFin:", error);
    process.exit(1);
  }
}

launchOpenFin();
