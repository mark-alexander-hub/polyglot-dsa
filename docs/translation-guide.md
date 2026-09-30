# Translation guide

This guide keeps every language sounding the same way: like a good teacher talking to
a student, not like a government textbook. Read it once before you translate or review.

## The eight rules

1. **Write how people really talk about code.** In Indian classrooms nobody says a
   formal native word for *pointer* or *stack*. Keep technical terms in English, in
   Latin script, and explain them in your language the first time they appear.
2. **Keep these terms in English:** data structure, array, linked list, stack, queue,
   node, pointer, index, element, value, size, capacity, push, pop, peek, top, front,
   rear, head, tail, enqueue, dequeue, insert, delete, memory, loop, function, class,
   program, output, overflow, underflow, time complexity, `O(1)`, `O(n)`, `O(log n)`,
   LIFO, FIFO, heap, min-heap, max-heap, priority queue, root, parent, child, leaf, level,
   swap, sift up, sift down, sort.
3. **Never translate code.** Code blocks, identifiers, program output and code
   comments stay exactly as they are in English.
4. **Keep the special lines exactly as they are.** Lines like `<!-- code: push -->`
   are replaced by the code on the website. Do not translate, move or delete them.
5. **Same headings, same order.** Your lesson must have the same number of `##`
   headings as the English one, in the same order. The checker warns if it does not.
6. **Use the digits 0-9**, not Devanagari, Kannada or Tamil numerals, so numbers match
   the code and the output. This includes Sanskrit.
7. **Speak to the reader politely but warmly:** Hindi आप, Kannada ನೀವು, Tamil நீங்கள்.
   Sanskrit addresses the readers as a class, in the second person plural (यूयम् …
   पश्यत, कुरुत, चिन्तयत), in plain classical prose: short sentences, common words,
   no archaic or poetic forms.
8. **Keep the examples.** If the English lesson uses a railway ticket queue, keep it.
   Swap an example only if yours is clearly closer to your readers, and never invent
   facts.

## Front matter

Every translated lesson starts with this block:

```yaml
---
translated_from: 3f9a1c0b2e4d
status: draft
reviewed_by:
---
```

* `translated_from` is a fingerprint of the English lesson you translated. Run
  `npm run translations -- --stamp hi stack` to fill it in. When the English lesson
  changes later, the website shows readers that your translation may be out of date.
* `status` is `draft` until a native speaker has read the whole lesson, then `reviewed`.
* `reviewed_by` is the reviewer's GitHub handle, for example `@your-name`.

## Glossary

Words we translate, so every lesson uses the same ones. If you think a word is wrong,
open an issue instead of changing it in one lesson only.

| English | हिन्दी | ಕನ್ನಡ | தமிழ் | संस्कृतम् |
|---|---|---|---|---|
| store / keep | रखना | ಇಡುವುದು | வைப்பது / சேமிப்பது | स्थापनम् / रक्षणम् |
| add | जोड़ना | ಸೇರಿಸುವುದು | சேர்ப்பது | योजनम् |
| remove | हटाना | ತೆಗೆದುಹಾಕುವುದು | நீக்குவது | अपनयनम् |
| search / find | ढूँढना | ಹುಡುಕುವುದು | தேடுவது | अन्वेषणम् |
| shift (move along) | खिसकाना | ಸರಿಸುವುದು | நகர்த்துவது | स्थानान्तरणम् |
| position | जगह | ಸ್ಥಾನ | இடம் | स्थानम् |
| order (sequence) | क्रम | ಕ್ರಮ | வரிசை முறை | क्रमः |
| empty | खाली | ಖಾಲಿ | காலி | रिक्तः |
| full | भरा हुआ | ತುಂಬಿದೆ | நிரம்பியது | पूर्णः |
| first / last | पहला / आख़िरी | ಮೊದಲ / ಕೊನೆಯ | முதல் / கடைசி | प्रथमः / अन्तिमः |
| next / previous | अगला / पिछला | ಮುಂದಿನ / ಹಿಂದಿನ | அடுத்த / முந்தைய | अग्रिमः / पूर्वः |
| fixed size | तय size | ನಿಗದಿತ size | நிலையான size | निश्चितः size |
| fast / slow | तेज़ / धीमा | ವೇಗ / ನಿಧಾನ | வேகம் / மெதுவானது | शीघ्रम् / मन्दम् |
| example | उदाहरण | ಉದಾಹರಣೆ | எடுத்துக்காட்டு | उदाहरणम् |
| mistake | गलती | ತಪ್ಪು | தவறு | त्रुटिः |
| practice | अभ्यास | ಅಭ್ಯಾಸ | பயிற்சி | अभ्यासः |
| LIFO, explained | जो आख़िर में आया, वो सबसे पहले जाएगा | ಕೊನೆಗೆ ಬಂದದ್ದು ಮೊದಲು ಹೋಗುತ್ತದೆ | கடைசியாக வந்தது முதலில் போகும் | यत् अन्ते आगतं तत् प्रथमं गच्छति |
| FIFO, explained | जो पहले आया, वो पहले जाएगा | ಮೊದಲು ಬಂದದ್ದು ಮೊದಲು ಹೋಗುತ್ತದೆ | முதலில் வந்தது முதலில் போகும் | यत् प्रथमम् आगतं तत् प्रथमं गच्छति |
| smallest / largest | सबसे छोटा / सबसे बड़ा | ಅತಿ ಚಿಕ್ಕ / ಅತಿ ದೊಡ್ಡ | மிகச் சிறிய / மிகப் பெரிய | लघुतमः / महत्तमः |
| urgent | ज़रूरी | ತುರ್ತು | அவசரமான | अत्यावश्यकम् |
| climb up / sink down (in a heap) | ऊपर चढ़ना / नीचे उतरना | ಮೇಲೆ ಏರುವುದು / ಕೆಳಗೆ ಇಳಿಯುವುದು | மேலே ஏறுவது / கீழே இறங்குவது | ऊर्ध्वम् आरोहणम् / अधः अवरोहणम् |
| tree (shape) | पेड़ | ಮರ | மரம் | वृक्षः |

**Tamil note:** வரிசை means both *order* and *a queue of people*. Use the English word
*queue* for the data structure, and வரிசையில் நிற்பது only for the real-life picture.

**Sanskrit note:** do not glue case endings onto English words (no *stack-स्य*). Point at
the English word with इति or इत्यस्य instead: *stack इत्यस्य top*, *code पठत*. Sandhi is
optional between words; write the form that is easiest to read.

## Standard headings

All lessons share these headings. Use exactly these words.

| English | हिन्दी | ಕನ್ನಡ | தமிழ் | संस्कृतम् |
|---|---|---|---|---|
| In real life | असल ज़िंदगी में | ನಿಜ ಜೀವನದಲ್ಲಿ | அன்றாட வாழ்க்கையில் | वास्तविकजीवने |
| How it works | ये काम कैसे करता है | ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ | இது எப்படி வேலை செய்கிறது | एतत् कथं कार्यं करोति |
| Operations | Operations | Operations | Operations | Operations |
| How fast is it? | ये कितना तेज़ है? | ಇದು ಎಷ್ಟು ವೇಗವಾಗಿದೆ? | இது எவ்வளவு வேகமானது? | एतत् कियत् शीघ्रम्? |
| Common mistakes | आम गलतियाँ | ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳು | பொதுவான தவறுகள் | सामान्याः त्रुटयः |
| Where is it used? | ये कहाँ काम आता है? | ಇದು ಎಲ್ಲಿ ಬಳಕೆಯಾಗುತ್ತದೆ? | இது எங்கே பயன்படுகிறது? | एतत् कुत्र प्रयुज्यते? |
| Try these | ये करके देखिए | ಇವುಗಳನ್ನು ಮಾಡಿ ನೋಡಿ | இவற்றைச் செய்து பாருங்கள் | एतानि कृत्वा पश्यत |

## Reviewing a translation

1. Read the English lesson, then the translation, on the website (`npm run dev`).
2. Fix anything that sounds unnatural, directly in the file.
3. When the whole lesson reads well, set `status: reviewed` and add your handle to
   `reviewed_by`.
4. Open a pull request. One lesson per pull request is perfect.
