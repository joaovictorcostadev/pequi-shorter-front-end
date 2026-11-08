import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PageTitleComponent } from './page-title-component';

@Component({
  imports: [PageTitleComponent],
  template: `
    <app-page-title
      [title]="title"
      [subtitle]="subtitle"
      [backButtonText]="backText"
      (backClick)="onBackClicked()"
    >
      <button class="test-action-btn">Novo Link</button>
    </app-page-title>
  `,
})
class TestHostComponent {
  title = 'Meus Links';
  subtitle = 'Gerencie seus links';
  backText = '';
  backClicked = false;

  onBackClicked(): void {
    this.backClicked = true;
  }
}

describe('PageTitleComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should render title and subtitle', () => {
    const compiled = hostFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title-heading')?.textContent).toContain('Meus Links');
    expect(compiled.querySelector('.page-title-subtitle')?.textContent).toContain('Gerencie seus links');
  });

  it('should project action content into page-title-actions', () => {
    const compiled = hostFixture.nativeElement as HTMLElement;
    const actionBtn = compiled.querySelector('.test-action-btn');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn?.textContent).toContain('Novo Link');
  });

  it('should show back button and emit backClick when clicked', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.backText = 'Voltar';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backBtn = compiled.querySelector('.back-button') as HTMLButtonElement;
    expect(backBtn).toBeTruthy();
    expect(backBtn.textContent).toContain('Voltar');

    backBtn.click();
    expect(fixture.componentInstance.backClicked).toBe(true);
  });
});
