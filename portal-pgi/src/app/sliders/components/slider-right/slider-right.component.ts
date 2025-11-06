import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, Input, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SlidersComponent } from '../../sliders.component';
import { COMPONENTS, TabComponent } from '../../models/tabs-components';
import { MapService } from 'src/app/services/map.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  @Input() isAtom = false;
  tabComponents = COMPONENTS
  currentTab: any | undefined;
  tabHeader = ""

  selectedTabName = ''
  selectedTabItem: any;

  componentRefs: { [componentName: string]: TabComponentRef } = {}

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private mapService: MapService,
    private route: ActivatedRoute
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
    const param = this.route.snapshot.queryParams?.url || null

    this.tabComponents.forEach(element => {
      if (this.isAtom && element.componentName === 'layers') {
      } else {
        this.addComponent(element.componentName, element.component, param)

      }

    });

    if (this.isAtom) {
      this.selectTab(this.tabComponents[1]);
    } else {
      this.selectTab(this.tabComponents[0]);
    }

    console.log
    if (param) {
      this.selectTab(this.tabComponents[1])
    } 

  }

  addComponent(componentName: string, component: any, param: string | null = null) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = this.container.createComponent(componentFactory);
    this.currentTab = componentRef;
    (componentRef.instance as any).isAtom = this.isAtom; // or false, or any value you want to set
    (componentRef.instance as any).url = param; // or false, or any value you want to set

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
    this.selectedTabItem.nativeElement.setAttribute('style', 'background-color: rgba(102, 102, 102, 0.6)');
    this.sliderService.closeRightSlider()
  }

  selectTab(tabComponent: TabComponent) {
    this.tabButtons.forEach(item => {
      if (item.nativeElement.id === tabComponent.componentName) {
        item.nativeElement.setAttribute('style', 'background-color: #666666');
        this.selectedTabItem = item
      }
      else {
        item.nativeElement.setAttribute('style', 'background-color: rgba(102, 102, 102, 0.6)');
      }
    })

    this.sliderService.openRightSlider()
    this.sliderRightService.selectedTab$.next(tabComponent)
  }

  public increaseZoom() {
    this.mapService.increaseZoom();
  }

  public decreaseZoom() {
    this.mapService.decreaseZoom();
  }

  public goBackPosition() {
    this.mapService.goBackPosition();
  }

  public goForwardPosition() {
    this.mapService.goForwardPosition();
  }

  public measureDistance() {
    this.mapService.activateDistanceMeasure();
  }

  public measureArea() {
    this.mapService.activateAreaMeasure();
  }


}
