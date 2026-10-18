import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { UserPageCompnent } from './user-page-compnent';

@Component({ template: '' })
class DummyComponent {}

@Component({
  imports: [UserPageCompnent],
  template: `
    <app-user-page-component>
      <div class="test-projected-content">Conteúdo Projetado</div>
    </app-user-page-component>
  `,
})
class TestHostComponent {}

describe('UserPageCompnent', () => {
  let component: UserPageCompnent;
  let fixture: ComponentFixture<UserPageCompnent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPageCompnent, TestHostComponent],
      providers: [
        provideRouter([
          { path: '**', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPageCompnent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should forward collapse state changes', () => {
    let emittedValue: boolean | undefined;
    component.sidebarCollapsedChange.subscribe((val) => (emittedValue = val));

    component.onSidebarCollapsed(true);
    expect(component.isSidebarCollapsed).toBe(true);
    expect(emittedValue).toBe(true);

    component.onSidebarCollapsed(false);
    expect(component.isSidebarCollapsed).toBe(false);
    expect(emittedValue).toBe(false);
  });

  it('should project content inside user-page-content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const compiled = hostFixture.nativeElement as HTMLElement;
    const projected = compiled.querySelector('.test-projected-content');
    expect(projected).toBeTruthy();
    expect(projected?.textContent).toContain('Conteúdo Projetado');
  });
});
