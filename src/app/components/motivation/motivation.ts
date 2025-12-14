import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input } from '@angular/core';
import { MotivationService } from '../../services/motivation.service';

@Component({
  selector: 'app-motivation',
  imports: [CommonModule],
  templateUrl: './motivation.html',
  styleUrl: './motivation.scss',
})
export class Motivation {

  motivationServ = inject(MotivationService);
  isLoading = computed(() => this.motivationServ.motivationText());

  motivationText = this.motivationServ.motivationText;

}
