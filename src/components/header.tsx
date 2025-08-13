import { Link, useLocation } from "react-router-dom";

export const Header: React.FC = () => {
  const location = useLocation();

  const links = [
    { to: "/home", label: "Home", color: "hover:bg-teal-300" },
    { to: "/apod", label: "Apod", color: "hover:bg-red-500" },
    { to: "/epic", label: "Epic", color: "hover:bg-blue-500" },
    { to: "/mars", label: "Mars", color: "hover:bg-red-400" },
  ];

  return (
    <header className="w-full bg-slate-700 shadow-md">
      <nav className="flex">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex items-center justify-center h-[50px] px-6 text-white uppercase text-sm transition-all duration-300 
                ${link.color} ${active ? "bg-teal-500" : ""}`}
            >
              {link.label}
              {/* Barre animée au hover */}
              <span
                className={`absolute bottom-0 left-0 w-full h-1 bg-white scale-x-0 origin-left transition-transform duration-300 ${
                  active ? "scale-x-100" : "group-hover:scale-x-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
