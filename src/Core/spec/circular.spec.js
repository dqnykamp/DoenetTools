import Core from "../Core"

describe("circular dependencies", function () {

  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })


  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
  test("hi", async function () {

    let core = new Core({doenetML:`
      <text name="t">hello</text>
    `, requestedVariant: 1})
    await core.getInitializedPromise();

    expect(await core.components["/t"].stateValues.value).toEqual("hello");

  })
})