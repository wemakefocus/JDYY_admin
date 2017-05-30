/**
 * Created by th3ee on 5/17/17.
 */
import { Component , OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { HeroService } from '../List/hero.service';
import { UserService } from '../List/user.service';
import 'rxjs/add/operator/switchMap'; // make the parameters Observable
import { Hero , User } from '../List/hero';
import { LocalDataSource } from 'ng2-smart-table';
@Component({
  selector: 'application',
  templateUrl: './apply.component.html',
})
export class ApplyComponent implements OnInit {

    hero: Hero;
    heroes: Hero[];
   users: User[];
  source: LocalDataSource = new LocalDataSource();
 nowuser: User;
 applyTo: string;

  constructor(
    private router: Router,
    private heroService: HeroService,
    private userService: UserService,
    private route: ActivatedRoute,
    private location: Location,

  ) {}

  ngOnInit(): void {
    this.route.params.switchMap((params: Params) => this.heroService.getHero(+params['id']))
      .subscribe(hero => {
        this.hero = hero;
      });
    this.getUser();
    this.getHeroes();
  }
  gotoAdd(): void {
    this.router.navigate(['../../add'], { relativeTo: this.route } );
  }
  getHeroes(): void {
    this.heroService.getHeroes().then((heroes) => {
      this.heroes = heroes;
      console.log(this.heroes);
    });
  }
  getUser(): void {
    this.userService.getData().then((data) => {
      this.source.load(data);
      console.log(data);
      this.users = data;
      console.log(this.users);
      this.nowuser = data[0];
      this.applyTo = data[1].name;
    });
  }
  goBack(): void {
    this.location.back(); // !
  }
  doVerify(): void {
    this.hero.status = 1;
  }
  save(): void {
    this.heroService.update(this.hero)
      .then(() => this.goBack());
  }
  add(name: string, age: string, status: number): void {
    name = name.trim();
    age = age.trim();
    status = 0;
    if (!name) {return; }
    this.heroService.create(name, age, status).then( hero => {
      console.log(hero);
      this.heroes.push(hero);
    });
  }

}
