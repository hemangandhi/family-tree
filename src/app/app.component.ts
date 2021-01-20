import {FlatTreeControl} from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

export enum Gender {
    MALE, FEMALE, OTHER
}

export class FamilyMember {
    name: string;
    gender: Gender;
    birthYear: number;
    spouse: number | null;
    children: number[];
    uuid: number;
}

export class FamilyTreeFlatNode {
    level: number;
    expanded: boolean;
    itemRef: number;
}


/**
 * This is the representation of a family tree. Technically this is a "family
 * forest" since there will be many roots to enable sharing the most knowledge.
 */
@Injectable()
export class FamilyTree {
    rootsChange = new BehaviorSubject<[Map<number, FamilyMember>, number]>([new Map<number, FamilyMember>(), 0]);

    get data(): [Map<number, FamilyMember>, number] { return this.rootsChange.value; }
    
    constructor() {
	// TODO: support a pre-loaded family tree.
    }

    grow(parent: FamilyMember) {
	this.data[0].set(this.data[1], {name: "", uuid: this.data[1]} as FamilyMember);
	parent.children.push(this.data[1]);
	this.rootsChange.next([this.data[0], this.data[1] + 1]);
    }

    name(memb: FamilyMember, name: string) {
	memb.name = name;
	this.rootsChange.next(this.data);
    }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [FamilyTree]
})
export class AppComponent {
    title = 'family-tree';

    // This is from the family tree.
    familyRefs = new Map<number, FamilyMember>();
    // This is based on the nodes that the tree controller demands.
    nodeRefs = new Map<number, FamilyTreeFlatNode>();

    transformer = (node: FamilyMember, level: number) => {
	const currentNode = this.nodeRefs.get(node.uuid);
	const newNode = currentNode && currentNode.itemRef === node.uuid ?
	    currentNode : new FamilyTreeFlatNode();
	newNode.itemRef = node.uuid;
	newNode.level = level;
	this.nodeRefs.set(node.uuid, newNode);
	return newNode;
    };

    getLevel = (n: FamilyTreeFlatNode) => n.level;
    isExpandable = (n: FamilyTreeFlatNode) => n.expanded;
    getChildren = (n: FamilyMember) => n.children.map(k => this.familyRefs.get(k));

    // See inside the constructor for how these are wired together.
    // The important values are above.
    treeControl: FlatTreeControl<FamilyTreeFlatNode>;
    treeFlattener: MatTreeFlattener<FamilyMember, FamilyTreeFlatNode>;
    dataSource: MatTreeFlatDataSource<FamilyMember, FamilyTreeFlatNode>;

    constructor (private _familyTree: FamilyTree) {
	this.treeFlattener = new MatTreeFlattener(this.transformer,
						  this.getLevel,
						  this.isExpandable,
						  this.getChildren);
	this.treeControl = new FlatTreeControl<FamilyTreeFlatNode>(
	    this.getLevel, this.isExpandable);
	this.dataSource = new MatTreeFlatDataSource(this.treeControl,
						    this.treeFlattener);

        _familyTree.rootsChange.subscribe(data => {
	    this.familyRefs = data[0];
	    this.dataSource.data = this.familyRefs.values();
        });
    }

    hasNoContent = (_: number, n: FamilyTreeFlatNode) => {
	const got = this.familyRefs.get(n.itemRef);
	return !got || got.name === "";
    }

    addNode(n: FamilyTreeFlatNode) {
	const parent = this.familyRefs.get(n.itemRef);
	this._familyTree.grow(parent!);
    }

    saveNode(n: FamilyTreeFlatNode, name: string) {
	const newNode = this.familyRefs.get(n.itemRef);
	this._familyTree.name(newNode!, name);
    }    
}
