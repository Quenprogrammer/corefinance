import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import {Transactions} from './admin/transactions/transactions';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Transactions],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('corefinance');
  constructor(private firestore: Firestore) {}

  async addItem() {
    try {
      const itemsCollection = collection(this.firestore, 'items'); // 'items' is the collection name
      const data = {
        name: 'Laptop',
        price: 150000,
        createdAt: new Date()
      };
      await addDoc(itemsCollection, data);
      console.log('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }
}
