import { createFileRoute, Await, useRouter } from "@tanstack/react-router";
import Versions from "../components/Versions";
import electronLogo from ".././assets/electron.svg";

export const Route = createFileRoute("/skata")({
  component: Idex,
  loader: async () => {
    const text = SlowPromise();
    return { slowdata: text };
  },
});

function Idex(): JSX.Element {
  const { slowdata } = Route.useLoaderData();
  const router = useRouter();

  const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

  return (
    <>
      <button onClick={() => { if (router.history.canGoBack()) router.history }}>Go Back</button>
      <div className="p-2">
        <h3>Welcome Home!</h3>
        <Await promise={slowdata} fallback={<p>loading...</p>}>
          {(data) => {
            return <span>{data}</span>;
          }}
        </Await>
      </div>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            fate skata
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  );
}

const SlowPromise = async (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve("text");
    }, 10000);
  });
};
