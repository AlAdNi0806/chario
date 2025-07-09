import { ethers } from "hardhat";

async function main() {
  const greeting = "Hello, world!";
  // const greeter = await ethers.deployContract("Greeter", [
  //   greeting,
  // ]);
  const greeter = await ethers.deployContract("Chario");
  await greeter.waitForDeployment();
  console.log(
    `Greeter with greeting "${greeting}" deployed to ${greeter.target}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
