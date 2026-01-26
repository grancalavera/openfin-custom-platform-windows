import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ProviderApp from "./ProviderApp";
import { initializePlatform } from "./platform";

const platformInitialized = initializePlatform();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <ProviderApp platformInitialized={platformInitialized} />
    </Suspense>
  </StrictMode>,
);
