import LeftParent from "./LeftParent";
import RightParent from "./RightParent";

function App() {
  return (
    <div
      id="main-container"
      className="p-4 grid grid-cols-6 gap-2 leading-8 h-screen"
    >
      <LeftParent
        className="p-4 w-full h-full bg-gray-200 col-span-2 rounded-md"
      />
      <RightParent
        className="p-4 w-full h-full bg-gray-200 col-span-4 rounded-md"
      />
    </div>
  );
}

export default App;
