// [{ regex: /\bfoo\b/g, alt: ['bar', ...] }, ...]
const replacements = [
  {
    regex: /\bShare an article, photo, video or idea\b/g,
    alt: 'FEED THE MACHINE'
  },
  {
    regex: /\blikes this\b/g,
    alt: [
      'wants you to know that they like this',
      'hopes you like that they like this',
      '"likes" this'
    ]
  },
  {
    regex: /\bWho's viewed your profile\b/g,
    alt: 'Your Klout'
  },
  {
    regex: /\bPeople like you are learning\b/g,
    alt: `You are a damn fool if you don't know this`
  }
];

runContentScript();

function runContentScript() {
  runWalker();

  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    switch (msg.type) {
      case 'log':
        // console.log(JSON.stringify(msg.data));
        break;
      case 'run':
        runWalker();
        break;
      default:
        console.log(msg);
    }
  });
}

function runWalker() {
  console.log('Running walker');
  walk(document.body);
}

function walk(node) {
  // I stole this function from cloud-to-butt which stole it from here:
  // http://is.gd/mwZp7E

  let child, next;

  if (
    node.nodeName.toLowerCase() == 'input' ||
    node.nodeName.toLowerCase() == 'textarea' ||
    (node.classList && node.classList.contains('ace_editor'))
  ) {
    return;
  }

  switch (node.nodeType) {
    case 1: // Element
    case 9: // Document
    case 11: // Document fragment
      child = node.firstChild;
      while (child) {
        next = child.nextSibling;
        walk(child);
        child = next;
      }
      break;

    case 3: // Text node
      if (node.fresh === false) return; // ignore previously handled nodes

      handleText(node);
      node.fresh = false;
      break;
  }
}

function handleText(textNode) {
  let v = textNode.nodeValue;

  replacements.map(replacement => {
    let replacementText;

    if (Array.isArray(replacement.alt)) {
      // if array, give a random pick
      const randomIndex = Math.floor(Math.random() * replacement.alt.length); // [0, replacement.alt.length)
      replacementText = replacement.alt[randomIndex];
    } else {
      replacementText = replacement.alt;
    }

    v = v.replace(replacement.regex, replacementText);
  });

  textNode.nodeValue = v;
}
