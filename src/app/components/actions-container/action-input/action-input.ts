import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from '../../../services/actions.service';

@Component({
  selector: 'app-action-input',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './action-input.html',
  styleUrl: './action-input.scss',
})
export class ActionInput {
  @Output() closeSheet = new EventEmitter<void>();
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  actionTitle = new FormControl('');

  actionService: ActionsService = inject(ActionsService);

  ngAfterViewInit() {
    setTimeout(() => {
      this.inputField?.nativeElement?.focus();
    }, 100);
  }

  // Add action
  onSubmit() {
    const title = this.actionTitle.value?.trim() || '';
    if (!title) return;
    this.actionService.add(title);
    this.actionTitle.reset();
    this.closeSheet.emit();
  }

}
