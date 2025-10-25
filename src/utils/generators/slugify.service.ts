import { Injectable } from '@nestjs/common';

@Injectable()
export class SlugifyFactory {
  private text: string;

  constructor() {
    this.text = '';
  }

  withText(text: string) {
    this.text = text.toString();
    return this;
  }

  withLowerCase() {
    this.text = this.text.toLowerCase();
    return this;
  }

  withUpperCase() {
    this.text = this.text.toUpperCase();
    return this;
  }

  withReplaceUnderscoreWithDash() {
    this.text = this.text.replace(/_/g, '-');
    return this;
  }

  withReplaceDashWithUnderscore() {
    this.text = this.text.replace(/-/g, '_');
    return this;
  }

  withReplaceSpacesWithDash() {
    this.text = this.text.replace(/\s+/g, '-');
    return this;
  }

  withReplaceSpacesWithUnderscore() {
    this.text = this.text.replace(/\s+/g, '_');
    return this;
  }

  withTrimStartAndEnd() {
    this.text = this.text.replace(/^-+/, '');
    this.text = this.text.replace(/-+$/, '');
    return this;
  }

  withRemoveNonWordChars() {
    this.text = this.text.replace(/\W+/g, '');
    return this;
  }

  WithDefaultOption(text: string) {
    this.text = text
      .toLocaleLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/\W+/g, '');
    return this;
  }

  build() {
    return this.text;
  }
}
