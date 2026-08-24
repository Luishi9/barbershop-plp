
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { NegocioProvider } from "@/context/NegocioContext";
  import "./styles/index.css";

  // NegocioProvider vive en la raíz para que CUALQUIER componente de la app
  // (login incluido) pueda consumir useNegocio sin importar las ramas de App.
  createRoot(document.getElementById("root")!).render(
    <NegocioProvider>
      <App />
    </NegocioProvider>
  );
