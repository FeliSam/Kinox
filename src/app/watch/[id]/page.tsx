import React from "react";
import WatchClient from "./WatchClient";

export async function generateStaticParams() {
  return [
    { id: "t-1" },
    { id: "t-2" },
    { id: "t-3" },
    { id: "t-4" },
    { id: "t-5" },
    { id: "t-6" },
    { id: "t-7" },
    { id: "tears-of-steel" },
    { id: "neon-horizon-2084" },
    { id: "sintel" },
    { id: "big-buck-bunny" },
    { id: "chroniques-terre-sauvage" },
    { id: "vitesse-pure-apex-horizon" },
    { id: "cosmos-express" },
  ];
}

export default function WatchPage({ params }: { params: { id: string } }) {
  return <WatchClient titleId={params.id} />;
}
