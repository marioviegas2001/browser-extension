// utils.js

function removeHTMLTags(text) {
    if (window.location.hostname === "www.publico.pt") {
      text = text.replace(/<section class="stack stack--learn-more stack-social-tools">.*?<\/section>/gis, '');
    }
    return text.replace(/<[^>]*>/g, ' '); // Replace HTML tags with an empty string
  }
  
  function countSentences(text) {
    const sentences = text.match(/[^.!?]*[.!?]/g);
    return sentences ? sentences.length : 0;
  }
  
  function countSyllables(word) {
    if (/\d/.test(word)) return 0;
    const vowels = word.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);
    if (!vowels) return 1;
    const digraphs = /lh|nh|ch|gu|qu/gi;
    const separated = word.split(digraphs);
    let syllableCount = separated.reduce((acc, part) => {
      const vowelClusters = part.match(/[aeiouáéíóúâêîôûãõàèìòù]+/gi);
      return acc + (vowelClusters ? vowelClusters.length : 0);
    }, 0);
    const hiatoA = word.match(/a[íìî]/gi) || [];
    const hiatoI = word.match(/(?<![gq])i[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];
    const hiatoU = word.match(/(?<![gq])u[aeiouáéíóúâêîôûãõàèìòù]/gi) || [];
    const hiatoCount = hiatoI.length + hiatoU.length + hiatoA.length;
    syllableCount += hiatoCount;
    return syllableCount;
  }
  
  function calculateReadabilityMetrics(cleanedText, imagesInArticle) {
    const words = cleanedText.trim().split(/\s+/);
    const wordCount = words.length;
    const sentenceCount = countSentences(cleanedText);
    const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);
    const readingTime = Math.ceil(wordCount / 238 + (imagesInArticle * 0.083));
    let fk = 0.883 * (wordCount / sentenceCount) + 17.347 * (syllableCount / wordCount) - 41.239;
    fk = Math.round(fk);
    return { wordCount, sentenceCount, syllableCount, readingTime, fk };
  }
  