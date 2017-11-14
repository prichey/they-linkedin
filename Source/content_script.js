// [
//   {
//     regex: /\bfoo\b/g,
//     probability: 1,
//     alt: ['bar', ...]
//   }, ...
// ];
const replacements = [
  {
    regex: /\bShare an article, photo, video or idea\b/g,
    probability: 0.7,
    alt: ['FEED THE MACHINE', 'Content goes here']
  },
  {
    regex: /\blikes this\b/g,
    probability: 0.7,
    alt: [
      'would like you to know that they like this',
      'hopes you like that they like this',
      '"likes" this',
      'is seeking your approval'
    ]
  },
  {
    regex: /\bWho's viewed your profile\b/g,
    probability: 0.8,
    alt: ['Your Klout', 'Your Quantified Desirability', 'Your Tumblarity']
  },
  {
    regex: /\bConnections\b/g,
    probability: 0.8,
    alt: ['"Connections"', 'People you totally know']
  },
  {
    regex: /\bJobs recommended for you\b/g,
    alt: 'The grass is greener over here'
  },
  {
    regex: /\bJobs you may be interested in\b/g,
    alt: `Things will be different`
  },
  {
    regex: /\bCompanies in your network\b/g,
    alt: `Engage with brands`
  },
  {
    regex: /\bTrending course you may be interested in\b/g,
    alt: `This definitely won't be a waste of time`
  },
  {
    regex: /\bAccess exclusive tools & insights\b/g,
    alt: `We will cast a spell on your enemies`
  },
  {
    regex: /\bPeople you may know\b/g,
    probability: 0.6,
    alt: ['Synergistic partners', 'The ones you have been waiting for']
  },
  {
    regex: /\bWhat people are talking about now\b/g,
    probability: 0.8,
    alt: 'Your boss expects you to know about this'
  },
  {
    regex: /\bWho to follow\b/g,
    probability: 0.4,
    alt: 'These people paid us to put their avatars here'
  },
  {
    regex: /\bcommented on this\b/g,
    probability: 0.5,
    alt: [
      'performatively engaged with this content',
      'has the answer',
      'wants you to see what they said'
    ]
  },
  {
    regex: /\bInvitations\b/g,
    probability: 0.9,
    alt: [
      'These people are thinking about you right now',
      'These people are the missing pieces',
      'These people are will change your life forever',
      'These people have been dreaming about your future together',
      'These people will complete you',
      'These are the chosen ones',
      'Among these is the one foretold'
    ]
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

    // if there's a probability, return if Math.random() > prob,
    // otherwise probability is 1
    if (!!replacement.probability) {
      if (Math.random() > replacement.probability) return;
    }

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
