---
translated_from: ba0b4418c4dc
status: draft
reviewed_by:
---

**Linked list** छोटे-छोटे boxes की एक chain है, जिन्हें **nodes** कहते हैं। हर node में एक value
होती है और अगले node का address होता है। List में आगे बढ़ने के लिए आप पहले node से शुरू करते हैं,
जिसे **head** कहते हैं, और एक-एक करके links के पीछे चलते जाते हैं, जब तक कोई अगला node न बचे।

## असल ज़िंदगी में

एक train के बारे में सोचिए। हर coach अपने पीछे वाले coach से जुड़ा होता है। आप आगे एक coach जोड़
सकते हैं, आख़िर में एक जोड़ सकते हैं, या बीच से एक coach अलग करके उसके आगे और पीछे वाले coaches को
आपस में जोड़ सकते हैं। बाक़ी coaches को अपनी जगह से हिलना ही नहीं पड़ता।

Treasure hunt भी ऐसे ही चलता है। पहला clue बताता है कि दूसरा clue कहाँ छिपा है, दूसरा बताता है कि
तीसरा कहाँ है, और ऐसे ही आगे। आप सीधे clue नंबर 5 पर नहीं जा सकते: आपको शुरू से chain के पीछे
चलना पड़ेगा।

## ये काम कैसे करता है

Array में values memory के एक ही हिस्से में अगल-बगल रखी होती हैं। Linked list अलग है: हर node
memory में कहीं भी हो सकता है। Nodes को आपस में जोड़ता है हर node के अंदर का `next` link।

- `head` पहले node की ओर point करता है। अगर list खाली है, तो `head` की value `null` होती है।
- आख़िरी node का `next` `null` होता है, जिसका मतलब है "chain यहीं ख़त्म होती है"।

(Python में `null` को `None` और C++ में `nullptr` कहते हैं।)

<!-- code: node -->

List को खुद सिर्फ़ head याद रखना होता है, और साथ में एक counter, ताकि पूरी chain पर चले बिना वो
अपना size बता सके।

<!-- code: setup -->

Linked list और array की तुलना ऐसे है:

| | Array | Linked list |
|---|---|---|
| Values कहाँ रहती हैं | memory में अगल-बगल | कहीं भी, links से जुड़ी हुई |
| Index 5 वाली value लेना | सीधे वहाँ पहुँचना, `O(1)` | head से चलकर जाना, `O(n)` |
| आगे एक value जोड़ना | हर value को दाईं ओर खिसकाना, `O(n)` | दो links बदलना, `O(1)` |
| Extra memory | कुछ नहीं | हर node में एक link |

## Operations

### add-first: आगे एक नया node रखना

1. Value के लिए एक नया node बनाइए।
2. नए node का `next` मौजूदा head की ओर point कीजिए।
3. `head` को नए node पर ले जाइए।

क्रम ज़रूरी है। अगर आप पहले `head` को हिला देंगे, तो पुराने पहले node का address खो जाएगा, और
उसके साथ बाक़ी पूरी list भी।

<!-- code: add-first -->

### add-last: आख़िर में एक नया node रखना

1. Value के लिए एक नया node बनाइए।
2. अगर list खाली है, तो नया node ही head बन जाता है, और काम ख़त्म।
3. नहीं तो, head से शुरू कीजिए और `next` के पीछे तब तक चलिए जब तक ऐसा node न मिल जाए जिसका
   `next` `null` हो। वही आख़िरी node है।
4. आख़िरी node का `next` नए node की ओर point कीजिए।

<!-- code: add-last -->

### find: क्या ये value list में है?

Head से शुरू कीजिए और हर node को बारी-बारी से जाँचिए। अगर किसी node में वो value है, तो जवाब है
हाँ। अगर आप आख़िरी node से आगे निकलकर `null` तक पहुँच गए, तो जवाब है नहीं।

<!-- code: find -->

### remove: किसी value वाला पहला node हटाना

1. अगर list खाली है, तो हटाने को कुछ नहीं है, इसलिए error देकर रुक जाइए।
2. अगर head में ही वो value है, तो `head` को दूसरे node पर ले जाइए। पुराना पहला node अब chain का
   हिस्सा नहीं रहा।
3. नहीं तो, `previous` नाम के pointer के साथ तब तक चलिए जब तक `previous.next` में वो value न मिल
   जाए। अगर उससे पहले आप आख़िर तक पहुँच गए, तो value list में नहीं है: error देकर रुक जाइए।
4. `previous.next` को उस node के आगे, यानी उसके बाद वाले node की ओर point कीजिए। अब chain उस node
   को छोड़कर आगे बढ़ती है।

<!-- code: remove -->

Step 4 का relinking सिर्फ़ एक line है और `O(1)` लेता है। समय तो उस node को ढूँढने के लिए चलने में
लगता है।

## ये कितना तेज़ है?

| Operation | ये क्या करता है | Time |
|---|---|---|
| `add-first` | आगे नया node | `O(1)` |
| `add-last` | आख़िर तक चलना, फिर जोड़ना | `O(n)` |
| `find` | nodes को एक-एक करके जाँचना | `O(n)` |
| `remove` | node तक चलना, फिर relink करना | `O(n)` |
| `size` | counter पढ़ना | `O(1)` |

> **Tail pointer से तेज़ add-last।** अगर list अपना आख़िरी node भी `tail` नाम के field में याद रखे,
> तो `add-last` को चलने की ज़रूरत नहीं पड़ती: नए node को `tail` के बाद जोड़िए, फिर `tail` को उस पर
> ले जाइए। इससे `add-last` `O(1)` हो जाता है, जो queue बनाते समय बहुत काम आता है।

`n` nodes वाली list को `O(n)` memory चाहिए, और हर node अपने साथ एक extra link रखता है।

## आम गलतियाँ

- **Links को गलत क्रम में बदलना।** `add-first` में अगर आप `node.next = head` से पहले
  `head = node` लिख देंगे, तो नया node खुद की ओर ही point करेगा और बाक़ी list खो जाएगी। हमेशा
  पहले नए node को जोड़िए, फिर पुराना pointer हिलाइए।
- **Head वाला case भूल जाना।** पहला node हटाना ख़ास है: उससे पहले कोई `previous` node नहीं होता,
  इसलिए आपको `head` को ही हिलाना पड़ता है। बहुत से bugs यहीं छिपे होते हैं।
- **आख़िर से आगे निकल जाना।** किसी node का `value` या `next` पढ़ने से पहले जाँचिए कि वो node
  `null` तो नहीं है।
- **गिनती गड़बड़ाना।** हर उस method में counter बदलिए जो node जोड़ता या हटाता है।
- **C++ में memory leaks।** `new` से बना हर node `delete` से free होना चाहिए, `remove` में भी और
  destructor में भी। Python, Java और JavaScript बेकार nodes को आपके लिए साफ़ कर देते हैं।

## ये कहाँ काम आता है?

- "Next" और "previous" buttons वाली **music playlists और photo galleries**। इनमें *doubly*
  linked list होती है, जिसमें हर node अपने पिछले node की ओर भी point करता है।
- **Hash tables** एक ही slot में आने वाली values के लिए छोटी-छोटी linked lists रखती हैं।
- **Stacks और queues** linked list पर बनाए जा सकते हैं, ताकि वो कभी भरें ही नहीं।
- **Operating systems** चल रहे programs और memory के खाली हिस्सों को linked lists में रखते हैं।

## ये करके देखिए

1. Playground में `7` के साथ add-first कीजिए, फिर `9` के साथ add-last। कौन-सा button list में
   चलता है और कौन-सा नहीं? क्यों?
2. एक function लिखिए जो list को उल्टे क्रम में print करे। (Hint: stack मदद करेगा।)
3. Program में एक `tail` field जोड़िए ताकि `add-last` `O(1)` हो जाए। `remove` में भी उसे update
   करना याद रखिए।
4. एक function लिखिए जो सिर्फ़ `next` links बदलकर list को उल्टा कर दे, कोई नया node बनाए बिना।
