import { useEffect, useState } from "react";
import { GridContainer } from "./App.styles.tsx";
import { MORA_JAI_BOXES, type MoraJaiBox } from "./boxes.tsx";
import { Menu, Game } from './components';

const MoraJaiPage = {
  Menu: "menu",
  Game: "game",
  Editor: "editor"
} as const;
type MoraJaiPage = (typeof MoraJaiPage)[keyof typeof MoraJaiPage];

const MoraJai = () => {
  const [page, setPage] = useState<MoraJaiPage>(MoraJaiPage.Menu);
  const [selectedBox, setSelectedBox] = useState<MoraJaiBox>(MORA_JAI_BOXES[0]!.boxes[0]!);

  useEffect(() => {
    const onPopState = () => {
      if (page === MoraJaiPage.Game) {
        setPage(MoraJaiPage.Menu);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [page]);

  const renderCurrentPage = () => {
    switch (page) {
      case MoraJaiPage.Menu:
        return (
          <Menu 
            onLevelSelected={(box: MoraJaiBox) => {
              setSelectedBox(box);
              setPage(MoraJaiPage.Game);
              window.history.pushState({ moraJai: "game" }, "Mora Jai Game");
            }} 
            onCreateLevel={() => setPage(MoraJaiPage.Editor)} 
          />
        );
      case MoraJaiPage.Game:
        return (
          <Game 
            onBack={() => setPage(MoraJaiPage.Menu)} 
            box={selectedBox} 
          />
        );
      default:
        return null;
    }
  };


  return (
    <GridContainer>
      {renderCurrentPage()}
    </GridContainer>
  );
};

//TODO add custom levels

export default MoraJai;