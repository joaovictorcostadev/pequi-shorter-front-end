import { Component } from '@angular/core';
import { UserPageCompnent } from '../../components/user-page-compnent/user-page-compnent';
import { PageTitleComponent } from '../../components/page-title-component/page-title-component';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [UserPageCompnent, PageTitleComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {}
