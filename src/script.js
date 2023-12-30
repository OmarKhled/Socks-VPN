let state = "off";

const powerButton = document.getElementById("power-button");

document.getElementById("power-button").addEventListener("click", () => {
  console.log("click");
  if (state == "off") {
    state = "loading";

    comm.send("power:on", {});
    // Turn On
  } else if (state == "on") {
    // Turn off
    state = "loading";
    comm.send("power:off", {});
  } else {
    if (state == "loading") {
      alert("Loading please wait");
      // console.log();
    }
  }

  comm.on("power:on", () => {
    powerButton.style.background = "#2D900A";
    powerButton.style.setProperty("--power", "#0D3300");
    console.log("Power Turned On");
    state = "on";
  });

  comm.on("power:off", () => {
    powerButton.style.background = "#526F47";
    powerButton.style.setProperty("--power", "#D9D9D9");
    console.log("Power Turned Off");
    state = "off";
  });
});
