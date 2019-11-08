## Introduction to formik2

### checkboxArray and singleRadio

```tsx
import { Formik, Form, Field, FormikHelpers } from "formik";
import {
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  Radio
} from "@material-ui/core";

export const App = () => {
  const handleSubmit = (
    values: any,
    { setSubmitting, resetForm }: FormikHelpers<any>
  ) => {
    setSubmitting(true);
    console.log(values);
    setSubmitting(false);
    resetForm();
  };

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        isTall: false,
        cookies: [],
        yogurt: ""
      }}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <div>
            <FormControlLabel
              label="cookie A"
              control={
                <Field
                  name="cookie"
                  type="checkbox"
                  value="cookieA"
                  as={Checkbox}
                />
              }
            />
            <FormControlLabel
              label="cookie B"
              control={
                <Field
                  name="cookie"
                  type="checkbox"
                  value="cookieB"
                  as={Checkbox}
                />
              }
            />
            <FormControlLabel
              label="cookie C"
              control={
                <Field
                  name="cookie"
                  type="checkbox"
                  value="cookieC"
                  as={Checkbox}
                />
              }
            />
          </div>
          <div>
            <Field name="yogurt" value="apple" type="radio" as={Radio} />
            <Field name="yogurt" value="pineapple" type="radio" as={Radio} />
            <Field name="yogurt" value="blueberry" type="radio" as={Radio} />
          </div>
          <Button type="submit">Submit</Button>
          <pre className="output">{JSON.stringify(values, null, 2)}</pre>
        </Form>
      )}
    </Formik>
  );
};
```

### custom fields

```tsx
import { useForm } from "formik";

type MyRadioProps = { label: string } & FieldAttributes<{}>;

const MyRadio: React.FC<MyRadioProps> = ({ label }) => {
  const [field] = useForm<{}>(); // field : contains onChange onBlur and ...
  return <FormControlInput label={label} control={<Radio {...field} />} />;
};

const App = () => (
  <Formik>
    {() => (
      <Form>
        <MyRadioProps
          label="strawberry"
          type="radio"
          name="milk"
          value="strawberry"
        />
      </Form>
    )}
  </Formik>
);
```

### validate

```tsx
const MyTextField: React.FC<FieldAttributes<{}>> = ({
  placeholder,
  ...props
}) => {
  const [field, meta] = useField<{}>(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      {...field}
      placeholder={placeholder}
      helperText={errorText}
      error={!!errorText}
    />
  );

  export const App = () => {
    return () => (
      <Formik
        initialValues={{
          noBob: ""
        }}
        onSubmit={handleSubmit}
        validate={values => {
          const errors: Record<string, string> = {};

          if (values.noBob === "bob") {
            errors.noBob = "noBob";
          }
          // return error object
          return errors;
        }}
      >
        {({ values }) => (
          <Form>
            <div>
              <MyTextField name="noBob" placeholder="noBob" type="text" />
            </div>
            <Button type="submit">Submit</Button>
            <pre className="output">{JSON.stringify(values, null, 2)}</pre>
          </Form>
        )}
      </Formik>
    );
  };
};
```

### fieldArray and it's validations

```tsx
const validationSchema = yup.object({
  pets: yup.array().of(
    yup.object({
      name: yup.string().required()
    })
  )
});

<Formik initialValues={{ pets: [] }} validationSchema={}>
  {() => (
    <FieldArray name="pets">
      {arrayHelpers => (
        <div>
          <Button
            onClick={() =>
              arrayHelpers.push({
                type: "frog",
                name: "",
                id: "" + Math.random()
              })
            }
          >
            add pet
          </Button>
          {values.pets.map((pet, index) => {
            return (
              <div key={pet.id}>
                <MyTextField
                  placeholder="pet name"
                  name={`pets.${index}.name`}
                />
                <Field name={`pets.${index}.type`} type="select" as={Select}>
                  <MenuItem value="cat">cat</MenuItem>
                  <MenuItem value="dog">dog</MenuItem>
                  <MenuItem value="frog">frog</MenuItem>
                </Field>
                <Button onClick={() => arrayHelpers.remove(index)}>x</Button>
              </div>
            );
          })}
        </div>
      )}
    </FieldArray>
  )}
</Formik>;
```
