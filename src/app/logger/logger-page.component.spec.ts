import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggerPage } from './logger-page.component';

describe('Tab1Page', () => {
  let component: LoggerPage;
  let fixture: ComponentFixture<LoggerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoggerPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
