import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Expense } from '../../models/order.model';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  @Input() month: number = new Date().getMonth();
  @Input() year: number = new Date().getFullYear();
  @Output() saved = new EventEmitter<void>();

  expenseForm: FormGroup;
  categories = [
    'Ingredients',
    'Packaging',
    'Delivery',
    'Equipment',
    'Marketing',
    'Utilities',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default date to first day of selected month/year
    const defaultDate = new Date(this.year, this.month, 1).toISOString().split('T')[0];
    this.expenseForm.patchValue({ date: defaultDate });
  }

  async onSubmit(): Promise<void> {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const expense: Expense = {
        id: this.dataService.generateId(),
        description: formValue.description,
        amount: formValue.amount,
        category: formValue.category,
        date: formValue.date
      };

      try {
        await this.dataService.addExpense(expense);
        this.expenseForm.reset();
        this.saved.emit();
      } catch (error) {
        console.error('Error saving expense:', error);
        alert('Failed to save expense. Please try again.');
      }
    } else {
      Object.keys(this.expenseForm.controls).forEach(key => {
        this.expenseForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.expenseForm.reset();
    this.saved.emit();
  }
}

