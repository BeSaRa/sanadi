(self.webpackChunksanadi = self.webpackChunksanadi || []).push([[964], {
  50964: (Be, k, s) => {
    s.r(k), s.d(k, {TeamInboxModule: () => De});
    var b = s(36895), _ = s(10911), f = s(22868), T = s(7625), S = s(87545), A = s(72986), y = s(591), N = s(8929),
      v = s(21086), O = s(61715), u = s(24006), r = s(50271), F = s(98930), p = s(41912), Z = s(35812), E = s(42472),
      g = s(45661), L = s(55211), e = s(94650), M = s(28966), $ = s(83989), w = s(73670), Q = s(90308), D = s(54416),
      U = s(33127), Y = s(52605), V = s(96819), J = s(53593), d = s(55013), B = s(57125), j = s(97415), P = s(3850),
      G = s(15662), R = s(92274), H = s(96826), K = s(83136), q = s(69417), z = s(82978), X = s(98151), W = s(46534),
      ee = s(98036);
    const te = ["table"];

    function oe(n, a) {
      if (1 & n && (e.TgZ(0, "option", 41), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.Q6J("ngValue", t), e.xp6(1), e.Oqu(t.getName())
      }
    }

    function ne(n, a) {
      if (1 & n && (e.TgZ(0, "select", 39), e.YNc(1, oe, 2, 2, "option", 40), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.Q6J("formControl", t.selectControl), e.xp6(1), e.Q6J("ngForOf", t.employeeService.teams)
      }
    }

    function ie(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "th", 42)(1, "table-header", 43), e.NdJ("onSelectFilter", function (i) {
          e.CHM(t);
          const l = e.oxw();
          return e.KtG(l.onInboxFiltered(i))
        })("textChange", function (i) {
          e.CHM(t);
          const l = e.oxw();
          return e.KtG(l.tableOptions.searchText = i)
        })("filterClicked", function (i) {
          e.CHM(t);
          const l = e.oxw();
          return e.KtG(l.tableOptions.filterCallback(i))
        }), e.qZA()()
      }
      if (2 & n) {
        const t = e.oxw(), o = e.MAs(6), i = e.MAs(1);
        e.xp6(1), e.Q6J("sort", o.dataSource.sort)("filterCriteria", t.filterCriteria)("stats", null == t.queryResultSet ? null : t.queryResultSet.stats)("useReloadValue", !0)("customTemplate", i)("reload$", t.inboxChange$)
      }
    }

    function ae(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "th", 44)(1, "input", 45), e.NdJ("change", function (i) {
          e.CHM(t), e.oxw();
          const l = e.MAs(6);
          return e.KtG(i ? l.toggleAll() : null)
        }), e.qZA()()
      }
      if (2 & n) {
        e.oxw();
        const t = e.MAs(6);
        e.xp6(1), e.Q6J("disabled", t.filter)("indeterminate", t.selection.hasValue() && !t.allSelected())("checked", t.selection.hasValue() && t.allSelected())
      }
    }

    function se(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "td", 46)(1, "input", 47), e.NdJ("click", function (i) {
          return i.stopPropagation()
        })("change", function (i) {
          const c = e.CHM(t).$implicit;
          e.oxw();
          const m = e.MAs(6);
          return e.KtG(i ? m.selection.toggle(c) : null)
        }), e.qZA()()
      }
      if (2 & n) {
        const t = a.$implicit;
        e.oxw();
        const o = e.MAs(6);
        e.xp6(1), e.Q6J("checked", o.selection.isSelected(t))
      }
    }

    function le(n, a) {
      1 & n && e._UZ(0, "th", 48)
    }

    function re(n, a) {
      if (1 & n && (e.TgZ(0, "td", 49), e._UZ(1, "work-item-status", 50), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.Q6J("item", t)
      }
    }

    function ce(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.serial_number, "")
      }
    }

    function de(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "td", 46)(1, "span", 52), e.NdJ("click", function () {
          const l = e.CHM(t).$implicit, c = e.oxw();
          return e.KtG(c.openTask(l))
        }), e._uU(2), e.qZA()()
      }
      if (2 & n) {
        const t = a.$implicit;
        e.xp6(2), e.Oqu(t.BD_FULL_SERIAL)
      }
    }

    function me(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.Oqu(t.lang.map.received_data)
      }
    }

    function he(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.ALo(2, "date"), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", e.lcZ(2, 1, t.ACTIVATED), " ")
      }
    }

    function ue(n, a) {
      if (1 & n && (e.TgZ(0, "th", 53), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.Q6J("sortParamAsFullItem", !0)("sortCallback", t.tableOptions.sortingCallbacks.displayNameInfo), e.xp6(1), e.Oqu(t.lang.map.action)
      }
    }

    function pe(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", t.displayNameInfo ? t.displayNameInfo.getName() : "", " ")
      }
    }

    function Ce(n, a) {
      if (1 & n && (e.TgZ(0, "th", 54), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.Q6J("sortCallback", t.tableOptions.sortingCallbacks.displayNameInfo), e.xp6(1), e.Oqu(t.lang.map.lbl_team)
      }
    }

    function xe(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", t.teamInfo.getName(), " ")
      }
    }

    function be(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.Oqu(t.lang.map.creation_date)
      }
    }

    function _e(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.ALo(2, "date"), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", e.lcZ(2, 1, t.PI_CREATE), " ")
      }
    }

    function fe(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.due_date, "")
      }
    }

    function Te(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46)(1, "span", 55), e._uU(2), e.ALo(3, "date"), e.qZA()()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.Q6J("tooltip", t.riskStatusInfo.getName())("ngClass", t.getRiskStatusColor()), e.xp6(1), e.Oqu(e.lcZ(3, 3, t.PI_DUE))
      }
    }

    function Ie(n, a) {
      if (1 & n && (e.TgZ(0, "th", 56), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.sender, "")
      }
    }

    function ke(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", t.fromUserInfo.getName(), " ")
      }
    }

    function Ae(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.service_type, "")
      }
    }

    function ge(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit, o = e.oxw();
        e.xp6(1), e.hij(" ", o.getServiceName(t.BD_CASE_TYPE), " ")
      }
    }

    function Se(n, a) {
      if (1 & n && (e.TgZ(0, "th", 51), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.subject, "")
      }
    }

    function ye(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", t.BD_SUBJECT, " ")
      }
    }

    function Ne(n, a) {
      if (1 & n && (e.TgZ(0, "th", 56), e._uU(1), e.qZA()), 2 & n) {
        const t = e.oxw();
        e.xp6(1), e.hij(" ", t.lang.map.lbl_organization, "")
      }
    }

    function ve(n, a) {
      if (1 & n && (e.TgZ(0, "td", 46), e._uU(1), e.qZA()), 2 & n) {
        const t = a.$implicit;
        e.xp6(1), e.hij(" ", t.orgInfo.getName(), " ")
      }
    }

    function Oe(n, a) {
      1 & n && e._UZ(0, "th", 56)
    }

    function Fe(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "td", 57)(1, "div", 58), e._UZ(2, "inbox-grid-actions", 59)(3, "div", 60), e.TgZ(4, "button", 61), e.NdJ("click", function (i) {
          const c = e.CHM(t).$implicit;
          e.oxw();
          const m = e.MAs(56);
          return e.KtG(m.open(i, c, void 0, !0))
        }), e._UZ(5, "i", 62), e.qZA()()()
      }
      if (2 & n) {
        const t = a.$implicit, o = e.oxw();
        e.xp6(2), e.Q6J("actions", o.gridActions)("model", t), e.xp6(2), e.Q6J("tooltip", o.lang.map.more)
      }
    }

    function Ze(n, a) {
      1 & n && e._UZ(0, "tr", 63)
    }

    function Ee(n, a) {
      1 & n && e._UZ(0, "tr", 64)
    }

    function Le(n, a) {
      if (1 & n) {
        const t = e.EpF();
        e.TgZ(0, "tr", 65), e.NdJ("contextmenu", function (i) {
          const c = e.CHM(t).$implicit;
          e.oxw();
          const m = e.MAs(56);
          return e.KtG(m.open(i, c))
        }), e.qZA()
      }
      2 & n && e.Q6J("model", a.$implicit)
    }

    function Me(n, a) {
      if (1 & n && (e.TgZ(0, "tr")(1, "td", 66), e._uU(2), e.qZA()()), 2 & n) {
        const t = e.oxw();
        e.xp6(2), e.Oqu(t.lang.map.no_records_to_display)
      }
    }

    const $e = [{
      path: "", component: (() => {
        class n {
          constructor(t, o, i, l, c, m, Ue, Ye, Ve) {
            this.lang = t, this.toast = o, this.router = i, this.inboxService = l, this.commonService = c, this.employeeService = m, this.globalSettingsService = Ue, this.userPreferencesService = Ye, this.dialog = Ve, this.inboxChange$ = new y.X(null), this.teams = [], this.destroy$ = new N.xQ, this.selectControl = new u.p4, this.actions = [], this.filterCriteria = {}, this.headerColumn = ["extra-header"], this.gridActions = [], this.tableOptions = {
              ready: !1,
              columns: ["workItemStatus", "BD_FULL_SERIAL", "BD_SUBJECT", "BD_CASE_TYPE", "action", "PI_CREATE", "ACTIVATED", "PI_DUE", "fromUserInfo", "team", "actions"],
              searchText: "",
              isSelectedRecords: () => !!(this.tableOptions && this.tableOptions.ready && this.table) && 0 !== this.table.selection.selected.length,
              searchCallback: (h, C) => h.search(C),
              filterCallback: (h = "OPEN") => {
                if ("CLEAR" === h) this.filterCriteria = {}, this.reloadSelectedInbox(); else if ("OPEN" === h) {
                  const C = this.inboxService.openFilterTeamInboxDialog(this.filterCriteria).subscribe(I => {
                    I.onAfterClose$.subscribe(x => {
                      !p.D.isValidValue(x) || x === F.k.CLOSE || (this.filterCriteria = x, this.reloadSelectedInbox(), C.unsubscribe())
                    })
                  })
                }
              },
              sortingCallbacks: {
                displayNameInfo: (h, C, I) => {
                  const x = p.D.isValidValue(h) ? h.displayNameInfo?.getName().toLowerCase() : "",
                    Je = p.D.isValidValue(C) ? C.displayNameInfo?.getName().toLowerCase() : "";
                  return p.D.getSortValue(x, Je, I.direction)
                }
              }
            }, this.employeeService.isExternalUser() && (this.tableOptions.columns = this.tableOptions.columns.filter(h => "orgInfo" !== h))
          }

          ngAfterViewInit() {
            Promise.resolve().then(() => {
              this.tableOptions.ready = !0
            })
          }

          ngOnDestroy() {
            this.destroy$.next(), this.destroy$.complete()
          }

          hasSelectedInbox() {
            return !!this.inboxChange$.value
          }

          loadSelectedTeamInbox() {
            if (!this.hasSelectedInbox()) return (0, v.of)(null);
            let t;
            return t = this.hasFilterCriteria() ? this.inboxService.loadTeamInbox(this.inboxChange$.value?.id, this.filterCriteria) : this.inboxService.loadTeamInbox(this.inboxChange$.value?.id), t.pipe((0, f.b)(() => this.commonService.loadCounters().subscribe())).pipe((0, f.b)(o => {
              this.queryResultSet = o, this.oldQueryResultSet = {...o}, this.table && this.table.clearSelection()
            }))
          }

          ngOnInit() {
            this.reloadDefaultTeam(), this.selectControl.patchValue(this.inboxChange$.value), this.listenToInboxChange(), this.listenToSelectControl(), this.buildGridActions(), this.setRefreshInterval(), this.validateOutOfOffice()
          }

          setRefreshInterval() {
            (0, O.F)(L.E.getMillisecondsFromMinutes(this.globalSettingsService.getGlobalSettings().inboxRefreshInterval)).pipe((0, T.R)(this.destroy$)).subscribe(() => this.inboxChange$.next(this.inboxChange$.value))
          }

          reloadDefaultTeam() {
            this.inboxChange$.next(this.employeeService.teams[0] || null)
          }

          listenToInboxChange() {
            this.inboxChange$.pipe((0, T.R)(this.destroy$), (0, S.w)(() => this.loadSelectedTeamInbox())).subscribe()
          }

          listenToSelectControl() {
            this.selectControl.valueChanges.pipe((0, T.R)(this.destroy$)).subscribe(t => {
              this.inboxChange$.next(t)
            })
          }

          reloadSelectedInbox() {
            this.inboxChange$.next(this.inboxChange$.value)
          }

          actionClaim(t, o, i, l, c) {
            t.claim().pipe((0, A.q)(1)).subscribe(m => {
              this.reloadSelectedInbox(), m.failedOperations && m.failedOperations.length ? this.toast.error(this.lang.map.something_went_wrong_while_taking_action) : (this.toast.success(this.lang.map.task_have_been_claimed_successfully), i && i.taskDetails.actions.splice(i.taskDetails.actions.indexOf(r.Q.ACTION_CLAIM), 1), i && i.taskDetails.actions.push(r.Q.ACTION_CANCEL_CLAIM), l && this.employeeService.isInternalUser() && (l.allowEditRecommendations = !0), l && l.handleReadonly && "function" == typeof l?.handleReadonly && l.handleReadonly(), c && c.checkForFinalApproveByMatrixNotification())
            })
          }

          actionMarkAsRead(t, o) {
            t.markAsRead().subscribe(i => {
              this.reloadSelectedInbox(), i.failedOperations && i.failedOperations.length ? this.toast.error(this.lang.map.something_went_wrong_while_taking_action) : (this.toast.success(this.lang.map.msg_mark_as_read_success), o && o.close && o?.close())
            })
          }

          actionMarkAsUnread(t, o) {
            t.markAsUnread().subscribe(i => {
              this.reloadSelectedInbox(), i.failedOperations && i.failedOperations.length ? this.toast.error(this.lang.map.something_went_wrong_while_taking_action) : (this.toast.success(this.lang.map.msg_mark_as_unread_success), o && o.close && o?.close())
            })
          }

          actionRelease(t, o) {
            t.release().subscribe(i => {
              this.reloadSelectedInbox(), i.failedOperations && i.failedOperations.length ? this.toast.error(this.lang.map.something_went_wrong_while_taking_action) : (this.toast.success(this.lang.map.task_have_been_released_successfully), o && o.close && o?.close())
            })
          }

          actionManageAttachments(t) {
            t.manageAttachments().onAfterClose$.subscribe(() => this.reloadSelectedInbox())
          }

          actionManageComments(t) {
            t.manageComments().onAfterClose$.subscribe(() => this.reloadSelectedInbox())
          }

          actionViewLogs(t) {
            t.viewLogs().onAfterClose$.subscribe(() => this.reloadSelectedInbox())
          }

          actionSendToUser(t, o) {
            t.sendToUser().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToStructureExpert(t, o) {
            t.sendToStructureExpert().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToDevelopmentExpert(t, o) {
            t.sendToDevelopmentExpert().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToDepartment(t, o) {
            t.sendToDepartment().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToSingleDepartment(t, o) {
            t.sendToSingleDepartment().onAfterClose$.subscribe(i => {
              o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToMultiDepartments(t, o) {
            t.sendToMultiDepartments().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionComplete(t, o) {
            t.complete().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionApprove(t, o) {
            t.approve().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionFinalApprove(t, o) {
            t.finalApprove().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionAskForConsultation(t, o) {
            t.askForConsultation().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionPostpone(t, o) {
            t.postpone().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionClose(t, o) {
            t.close().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionReject(t, o) {
            t.reject().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionReturn(t, o) {
            t.return().onAfterClose$.subscribe(i => {
              this.reloadSelectedInbox(), i && o && o.close && o?.close()
            })
          }

          actionOpen(t) {
            this.router.navigate([t.itemRoute], {queryParams: {item: t.itemDetails}}).then()
          }

          actionClaimBeforeOpen(t) {
            t.claim().subscribe(() => {
              this.actionOpen(t)
            })
          }

          openTask(t) {
            this.inboxChange$.value && this.inboxChange$.value?.autoClaim ? this.actionClaimBeforeOpen(t) : this.actionOpen(t)
          }

          actionSendToManager(t, o) {
            t.sendToManager().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          actionSendToGeneralManager(t, o) {
            t.sendToGeneralManager().onAfterClose$.subscribe(i => {
              i && o && o.close && o?.close(), this.reloadSelectedInbox()
            })
          }

          buildGridActions() {
            this.actions = [{
              type: "action",
              icon: "mdi-eye",
              label: "open_task",
              data: {hideFromViewer: !0},
              hideLabel: !0,
              displayInGrid: !1,
              onClick: t => this.openTask(t)
            }, {
              type: "action",
              icon: "mdi-view-list-outline",
              label: "logs",
              hideLabel: !0,
              displayInGrid: !0,
              onClick: t => this.actionViewLogs(t)
            }, {
              type: "action",
              icon: "mdi-paperclip",
              label: "manage_attachments",
              data: {hideFromViewer: !0},
              show: t => !1,
              onClick: t => {
                this.actionManageAttachments(t)
              }
            }, {
              type: "action",
              icon: "mdi-comment-text-multiple-outline",
              label: "manage_comments",
              data: {hideFromViewer: !0},
              show: t => this.employeeService.isInternalUser() && t.getCaseStatus() !== E.w.CANCELLED,
              onClick: t => {
                this.actionManageComments(t)
              }
            }, {
              type: "action",
              icon: "mdi-hand-back-right",
              label: "claim",
              hideLabel: !0,
              displayInGrid: !0,
              data: {hideFromViewer: t => t.taskDetails.actions && -1 === t.taskDetails.actions.indexOf(r.Q.ACTION_CLAIM)},
              onClick: (t, o, i, l, c) => {
                this.actionClaim(t, o, i, l, c)
              }
            }, {
              type: "action",
              icon: "mdi-hand-okay",
              label: "release_task",
              data: {
                hideFromViewer: t => t.taskDetails.actions && !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM),
                hideFromContext: !0
              },
              onClick: (t, o) => this.actionRelease(t, o)
            }, {type: "divider"}, {
              type: "action",
              icon: "mdi-send-circle",
              label: "send_to_competent_dep",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToDepartment(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-send-circle",
              label: "send_to_multi_departments",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToMultiDepartments(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-account-arrow-right",
              label: "send_to_user",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToUser(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-account-arrow-right",
              label: "send_to_structure_expert",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToStructureExpert(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-account-arrow-right",
              label: "send_to_development_expert",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToDevelopmentExpert(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-card-account-details-star",
              label: "send_to_manager",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToManager(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-card-account-details-star",
              label: "send_to_general_manager",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionSendToGeneralManager(t, o)
              }
            }, {type: "divider"}, {
              type: "action",
              icon: "mdi-book-check",
              label: "task_complete",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionComplete(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-check-bold",
              label: "approve_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionApprove(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-check-underline",
              label: t => t.getCaseType() === Z.O.INTERNAL_PROJECT_LICENSE ? this.lang.map.final_approve_task_based_on_matrix : this.lang.map.final_approve_task,
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionFinalApprove(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-help-rhombus-outline",
              label: "ask_for_consultation_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionAskForConsultation(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-calendar-clock",
              label: "postpone_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionPostpone(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-undo-variant",
              label: "return_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionReturn(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-book-remove-outline",
              label: "reject_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionReject(t, o)
              }
            }, {
              type: "action",
              icon: "mdi-close-circle-outline",
              label: "cancel_task",
              data: {
                hideFromContext: !0,
                hideFromViewer: t => !t.taskDetails.actions.includes(r.Q.ACTION_CANCEL_CLAIM)
              },
              show: t => !1,
              onClick: (t, o) => {
                this.actionClose(t, o)
              }
            }, {
              type: "action",
              icon: g.m.OPEN_MAIL,
              label: "mark_as_read",
              displayInGrid: !1,
              data: {hideFromViewer: !0},
              show: t => !t.isRead(),
              onClick: t => this.actionMarkAsRead(t)
            }, {
              type: "action",
              icon: g.m.CLOSE_MAIL,
              label: "mark_as_unread",
              displayInGrid: !1,
              show: t => t.isRead(),
              onClick: t => this.actionMarkAsUnread(t)
            }], this.gridActions = this.actions.filter(t => t.displayInGrid)
          }

          displayStepName(t) {
            return this.lang.map[t.TAD_DISPLAY_NAME]
          }

          getServiceName(t) {
            let o;
            try {
              o = this.inboxService.getService(t).serviceKey
            } catch {
              return ""
            }
            return this.lang.getLocalByKey(o).getName()
          }

          hasFilterCriteria() {
            return !p.D.isEmptyObject(this.filterCriteria) && p.D.objectHasValue(this.filterCriteria)
          }

          onInboxFiltered(t) {
            this.queryResultSet.items = t ? this.oldQueryResultSet.items.filter(o => o.riskStatusInfo.lookupKey === t.lookupKey) : this.oldQueryResultSet.items
          }

          validateOutOfOffice() {
            this.userPreferencesService.validateOutOfOffice().pipe((0, A.q)(1), (0, f.b)(t => {
              t && this.dialog.alert(this.lang.map.msg_user_oof_mode)
            })).subscribe()
          }
        }

        return n.\u0275fac = function (t) {
          return new (t || n)(e.Y36(M.C), e.Y36($.k), e.Y36(_.F0), e.Y36(w.m), e.Y36(Q.v), e.Y36(D.G), e.Y36(U.o), e.Y36(Y._), e.Y36(V.x))
        }, n.\u0275cmp = e.Xpm({
          type: n,
          selectors: [["team-inbox"]],
          viewQuery: function (t, o) {
            if (1 & t && e.Gf(te, 5), 2 & t) {
              let i;
              e.iGM(i = e.CRH()) && (o.table = i.first)
            }
          },
          decls: 57,
          vars: 12,
          consts: [["teamsSelect", ""], [1, "row"], [1, "col-12"], [1, "table-responsive"], ["sortableTable", "", 3, "selectable", "paginator", "columns", "data", "filter", "useSearchToFilter"], ["table", ""], ["cdk-table", "", 1, "table", "border", "border-1", 3, "dataSource"], ["cdkColumnDef", "extra-header"], ["class", "extra-header", "cdk-header-cell", "", "colSpan", "100", 4, "cdkHeaderCellDef"], ["cdkColumnDef", "rowSelection"], ["cdk-header-cell", "", "class", "td-checkbox", 4, "cdkHeaderCellDef"], ["cdk-cell", "", 4, "cdkCellDef"], ["cdkColumnDef", "workItemStatus"], ["style", "width:8px", "class", "p-0", "cdk-header-cell", "", "sortable-header", "", 4, "cdkHeaderCellDef"], ["cdk-cell", "", "class", "position-relative p-0", 4, "cdkCellDef"], ["cdkColumnDef", "BD_FULL_SERIAL"], ["cdk-header-cell", "", "sortable-header", "", 4, "cdkHeaderCellDef"], ["cdkColumnDef", "ACTIVATED"], ["cdkColumnDef", "action"], ["cdk-header-cell", "", "sortable-header", "", 3, "sortParamAsFullItem", "sortCallback", 4, "cdkHeaderCellDef"], ["cdkColumnDef", "team"], ["cdk-header-cell", "", "sortable-header", "", 3, "sortCallback", 4, "cdkHeaderCellDef"], ["cdkColumnDef", "PI_CREATE"], ["cdkColumnDef", "PI_DUE"], ["cdkColumnDef", "fromUserInfo"], ["cdk-header-cell", "", 4, "cdkHeaderCellDef"], ["cdkColumnDef", "BD_CASE_TYPE"], ["cdkColumnDef", "BD_SUBJECT"], ["cdkColumnDef", "orgInfo"], ["cdkColumnDef", "actions"], ["cdk-cell", "", "class", "table-actions", 4, "cdkCellDef"], ["cdk-header-row", "", 4, "cdkHeaderRowDef"], ["cdk-header-row", "", "class", "table-row-header", 4, "cdkHeaderRowDef"], ["cdk-row", "", "riskStatus", "", "readUnread", "", 3, "model", "contextmenu", 4, "cdkRowDef", "cdkRowDefColumns"], [4, "cdkNoDataRow"], [3, "length"], ["paginator", ""], [3, "actions"], ["menu", ""], [1, "form-select", "form-select-sm", "mx-4", 3, "formControl"], [3, "ngValue", 4, "ngFor", "ngForOf"], [3, "ngValue"], ["cdk-header-cell", "", "colSpan", "100", 1, "extra-header"], ["tableTitle", "menu_team_inbox", 3, "sort", "filterCriteria", "stats", "useReloadValue", "customTemplate", "reload$", "onSelectFilter", "textChange", "filterClicked"], ["cdk-header-cell", "", 1, "td-checkbox"], ["type", "checkbox", 1, "form-check-input", 3, "disabled", "indeterminate", "checked", "change"], ["cdk-cell", ""], ["type", "checkbox", 1, "form-check-input", 3, "checked", "click", "change"], ["cdk-header-cell", "", "sortable-header", "", 1, "p-0", 2, "width", "8px"], ["cdk-cell", "", 1, "position-relative", "p-0"], [3, "item"], ["cdk-header-cell", "", "sortable-header", ""], [1, "dir-ltr", "text-primary", "cursor-pointer", "text-decoration-underline", 3, "click"], ["cdk-header-cell", "", "sortable-header", "", 3, "sortParamAsFullItem", "sortCallback"], ["cdk-header-cell", "", "sortable-header", "", 3, "sortCallback"], [3, "tooltip", "ngClass"], ["cdk-header-cell", ""], ["cdk-cell", "", 1, "table-actions"], [1, "d-flex"], [3, "actions", "model"], [1, "vr"], [1, "btn", "p-0", "icon-btn", 3, "tooltip", "click"], [1, "mdi", "mdi-dots-vertical", "text-primary"], ["cdk-header-row", ""], ["cdk-header-row", "", 1, "table-row-header"], ["cdk-row", "", "riskStatus", "", "readUnread", "", 3, "model", "contextmenu"], ["colspan", "100", 1, "text-center"]],
          template: function (t, o) {
            if (1 & t && (e.YNc(0, ne, 2, 2, "ng-template", null, 0, e.W1O), e.TgZ(2, "div", 1)(3, "div", 2)(4, "div", 3)(5, "app-table", 4, 5)(7, "table", 6), e.ynx(8, 7), e.YNc(9, ie, 2, 6, "th", 8), e.BQk(), e.ynx(10, 9), e.YNc(11, ae, 2, 3, "th", 10), e.YNc(12, se, 2, 1, "td", 11), e.BQk(), e.ynx(13, 12), e.YNc(14, le, 1, 0, "th", 13), e.YNc(15, re, 2, 1, "td", 14), e.BQk(), e.ynx(16, 15), e.YNc(17, ce, 2, 1, "th", 16), e.YNc(18, de, 3, 1, "td", 11), e.BQk(), e.ynx(19, 17), e.YNc(20, me, 2, 1, "th", 16), e.YNc(21, he, 3, 3, "td", 11), e.BQk(), e.ynx(22, 18), e.YNc(23, ue, 2, 3, "th", 19), e.YNc(24, pe, 2, 1, "td", 11), e.BQk(), e.ynx(25, 20), e.YNc(26, Ce, 2, 2, "th", 21), e.YNc(27, xe, 2, 1, "td", 11), e.BQk(), e.ynx(28, 22), e.YNc(29, be, 2, 1, "th", 16), e.YNc(30, _e, 3, 3, "td", 11), e.BQk(), e.ynx(31, 23), e.YNc(32, fe, 2, 1, "th", 16), e.YNc(33, Te, 4, 5, "td", 11), e.BQk(), e.ynx(34, 24), e.YNc(35, Ie, 2, 1, "th", 25), e.YNc(36, ke, 2, 1, "td", 11), e.BQk(), e.ynx(37, 26), e.YNc(38, Ae, 2, 1, "th", 16), e.YNc(39, ge, 2, 1, "td", 11), e.BQk(), e.ynx(40, 27), e.YNc(41, Se, 2, 1, "th", 16), e.YNc(42, ye, 2, 1, "td", 11), e.BQk(), e.ynx(43, 28), e.YNc(44, Ne, 2, 1, "th", 25), e.YNc(45, ve, 2, 1, "td", 11), e.BQk(), e.ynx(46, 29), e.YNc(47, Oe, 1, 0, "th", 25), e.YNc(48, Fe, 6, 3, "td", 30), e.BQk(), e.YNc(49, Ze, 1, 0, "tr", 31), e.YNc(50, Ee, 1, 0, "tr", 32), e.YNc(51, Le, 1, 1, "tr", 33), e.YNc(52, Me, 3, 1, "tr", 34), e.qZA(), e._UZ(53, "app-paginator", 35, 36), e.qZA()()()(), e._UZ(55, "context-menu-item", 37, 38)), 2 & t) {
              const i = e.MAs(6), l = e.MAs(54);
              e.xp6(5), e.Q6J("selectable", !0)("paginator", l)("columns", o.tableOptions.columns)("data", null == o.queryResultSet ? null : o.queryResultSet.items)("filter", o.tableOptions.searchText)("useSearchToFilter", !0), e.xp6(2), e.Q6J("dataSource", i.dataSource), e.xp6(42), e.Q6J("cdkHeaderRowDef", o.headerColumn), e.xp6(1), e.Q6J("cdkHeaderRowDef", i.columns), e.xp6(1), e.Q6J("cdkRowDefColumns", i.columns), e.xp6(2), e.Q6J("length", (null == o.queryResultSet ? null : o.queryResultSet.totalCount) || 0), e.xp6(2), e.Q6J("actions", o.actions)
            }
          },
          dependencies: [b.mk, b.sg, J.q, d.zC, d.Sq, d.O_, d.D5, d.fo, d.hD, d._J, d.Af, d.xN, d.s$, d.r2, u.YN, u.Kr, u.EJ, u.JJ, u.oH, B.i, j.a, P.Q, G.N, R.J, H.R, K.a, q.m, z.G, X.V, W.P, ee.u]
        }), n
      })()
    }];
    let we = (() => {
      class n {
      }

      return n.\u0275fac = function (t) {
        return new (t || n)
      }, n.\u0275mod = e.oAB({type: n}), n.\u0275inj = e.cJS({imports: [_.Bz.forChild($e), _.Bz]}), n
    })();
    var Qe = s(58547);
    let De = (() => {
      class n {
      }

      return n.\u0275fac = function (t) {
        return new (t || n)
      }, n.\u0275mod = e.oAB({type: n}), n.\u0275inj = e.cJS({imports: [b.ez, Qe.m, we]}), n
    })()
  }
}]);
