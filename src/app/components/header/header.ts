import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [DatePipe,],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  get date() {
    return new Date();
  }

}
