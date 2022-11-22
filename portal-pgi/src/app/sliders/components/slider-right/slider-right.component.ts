import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, QueryList,  ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SlidersComponent } from '../../sliders.component';
import { COMPONENTS, TabComponent } from '../../models/tabs-components';

interface TabComponentRef {
  componentRef: any
}

@Component({
  selector: 'app-slider-right',
  templateUrl: './slider-right.component.html',
  styleUrls: ['./slider-right.component.scss'],
})
export class SliderRightComponent extends SlidersComponent implements AfterViewInit {
  @ViewChildren('tabButtons') tabButtons!: QueryList<ElementRef>;

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  
  tabComponents = COMPONENTS
  currentTab: any | undefined;
  tabHeader = ""

  selectedTabName = ''
  selectedTabItem: any;

  componentRefs: { [componentName: string]: TabComponentRef } = {}

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
) {
    super();

    this.sliderRightService.selectedTab$?.pipe(
      tap(tabComponent => { this.switchComponent(tabComponent) })
    ).subscribe()
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initTabComponents()
    }, 10);
  }

  initTabComponents() {
    this.tabComponents.forEach(element => {
      this.addComponent(element.componentName, element.component)
    });
  }

  addComponent(componentName: string, component: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = this.container.createComponent(componentFactory);
    this.currentTab = componentRef
    this.componentRefs[componentName] = {
      componentRef: componentRef
    }
  }

  switchComponent(component: TabComponent) {
    if (this.currentTab !== undefined) {
      this.currentTab.instance.hidden = true
      this.currentTab = this.componentRefs[component.componentName].componentRef
      this.currentTab.instance.hidden = false

      this.tabHeader = component.tabHeader
    }
  }

  closeTab() {
    this.selectedTabItem.nativeElement.setAttribute('style', 'background-color: #8D9EAC');
    this.sliderService.closeRightSlider()
  }

  selectTab(tabComponent: TabComponent){
    this.tabButtons.forEach(item => {
      if (item.nativeElement.id === tabComponent.componentName){
        item.nativeElement.setAttribute('style', 'background-color: #566978');
        this.selectedTabItem = item
      }
      else{
        item.nativeElement.setAttribute('style', 'background-color: #8D9EAC');
      }
    })

    this.sliderService.openRightSlider()
    this.sliderRightService.selectedTab$.next(tabComponent)
  }
}
