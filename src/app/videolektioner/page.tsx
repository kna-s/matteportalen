import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Videos() {
  return (
    <div>
      <PageHeader
        icon="🎥"
        title="Videolektioner"
        intro="Korta videor där våra lärare förklarar ett delmoment i taget. Pausa, spola tillbaka och titta så många gånger du vill. Nya lektioner läggs upp varje månad."
      />
      <StepTypeList type="video" />
    </div>
  );
}
