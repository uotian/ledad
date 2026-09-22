import { translate } from "@/lib/translate";
import type { ItemFlush } from "@/lib/types";
import type { ItemFlushLastRef, Langs, SetItems } from "../../types";

export async function updateTranslation(item: ItemFlush, langs: Langs, itemFlushLast: ItemFlushLastRef, setItems: SetItems) {
  const translation = await translate({ langFrom: langs.from, langTo: langs.to, text: item.transcripts[0] });
  if (translation !== null) {
    if (itemFlushLast.current?.id === item.id) itemFlushLast.current = { ...itemFlushLast.current, translations: [translation] };
    setItems((itemsCurrent) =>
      itemsCurrent.map((itemCurrent) =>
        itemCurrent.id === item.id ? { ...itemCurrent, translations: [translation] } : itemCurrent,
      ),
    );
  }
}
