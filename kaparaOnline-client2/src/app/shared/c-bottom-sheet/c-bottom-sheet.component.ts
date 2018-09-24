import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-bottom-sheet',
  templateUrl: './c-bottom-sheet.component.html',
  styleUrls: ['./c-bottom-sheet.component.css']
})
export class CBottomSheetComponent implements OnInit {
  public mainOpacity: string = '0';
  public message: string;
  public cookie: boolean = false;
  public show: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  public tellUserAboutCookies() {
    if (!(localStorage.getItem("cookie_knowledge") &&
      localStorage.getItem("cookie_knowledge") == "user_knows")) {
      this.handleCookieMessage();
    };
  };

  public handleCookieMessage() {
    // user doesn't know about cookie so let him know that.
    this.cookie = true;
    let message = `Our Website is using cookies technology for improving our users experience.
    We just make sure that you understand that and agree.`;
    this.releaseBottomSheetMessage(message);
  };

  public releaseBottomSheetMessage(message) {
    let timeString: string = this.customizeTime();
    this.message = timeString + message;
    this.show = true;
    this.mainOpacity = '1';
  };

  public hideMe() {
    this.cookieSession();
    this.mainOpacity = '0';
    setTimeout(() => this.show = false, 1500);
  };

  public cookieSession() {
    if (this.cookie) {
      this.cookie = !this.cookie;
      localStorage.setItem("cookie_knowledge", "user_knows");
    };
  };

  public customizeTime(): string {
    var userTime = new Date().getHours();
    let timeMessage: string = `Good `;
    if (userTime >= 6 && userTime < 12)
      timeMessage += "Morning!";
    else if (userTime >= 12 && userTime < 18)
      timeMessage += "Afternoon!";
    else if (userTime >= 18 && userTime < 24)
      timeMessage += "Evening!";
    else if (userTime < 6)
      timeMessage += "Night!";
    return timeMessage += `\n`;
  };
}
