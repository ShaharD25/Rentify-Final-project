import logo from "../images/orange-logo.png";

export default function Splash() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FF8A00" }}
    >
      <img
        src={logo}
        alt="orange-logo.png"
        className="w-80 h-auto"
      />
    </div>
  );
}