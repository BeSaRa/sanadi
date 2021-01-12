// @ts-ignore
String.prototype.change = function() {
  if (!arguments.length) {
    return String(this);
  }

  let updatedText: string = String(this);

  for (const key in arguments[0]) {
    if (arguments[0].hasOwnProperty(key)) {
      const value = (typeof arguments[0][key] !== undefined && arguments[0][key] !== null) ? arguments[0][key] : '';
      const regex = new RegExp(':' + key, 'g');
      const regex2 = new RegExp('{{' + key + '}}', 'g');
      const regex3 = new RegExp('{' + key + '}', 'g');
      updatedText = updatedText.replace(regex, value);
      updatedText = updatedText.replace(regex2, value);
      updatedText = updatedText.replace(regex3, value);
    }
  }
  return updatedText;
};
