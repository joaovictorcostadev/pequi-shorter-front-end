import { Component } from '@angular/core';
import { UserPageCompnent } from '../../components/user-page-compnent/user-page-compnent';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [UserPageCompnent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {}
